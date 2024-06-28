import pandas as pd
import json
import matplotlib.pyplot as plt
import seaborn as sns
import scipy.stats as stats

# Check quiz answers
def check_answers(participant_tasks_df):
    answers_checked_df = pd.DataFrame()

    # Check every quiz one by one
    for task in participant_tasks_df['task'].unique():
        with open(f'../task/questions/{task}.json') as file:
            quiz = json.load(file)

        answers_df = participant_tasks_df[participant_tasks_df['task'] == task]

        # Check every question in the quiz one by one
        for i, question in enumerate(quiz):
            question_nr = i + 1
            answer_column = f'Q{question_nr}'

            answer_correct_df = False

            # Check multiple choice questions
            if question['type'] == "multiple_choice":
                answer_df = answers_df[answer_column]
                answer_correct_df = answer_df == question['options'][question['answer']]

            # Check questions asking for a single line number
            elif question['type'] == "line":
                answer_df = answers_df[answer_column].replace(r'\.0*$', '', regex=True).astype(int)
                answer_correct_df = answer_df.isin(question['answer'])

            # Check questions asking for a range of line numbers
            elif question['type'] == "block":
                start_df = answers_df[f'{answer_column}_1'].replace(r'\.0*$', '', regex=True).astype(int)
                end_df = answers_df[f'{answer_column}_2'].replace(r'\.0*$', '', regex=True).astype(int)
                answer_df = pd.concat([start_df, end_df], axis=1).agg(list, axis=1)
                answer_correct_df = answer_df.isin(question['answer'])

            # Check questions asking for one or more textual inputs, check for exact equality or using regex
            elif question['type'] in ['text', 'regex']:
                if 'multiple' in question and question['multiple']:
                    answer_dfs = [
                        answers_df[f'{answer_column}_{i + 1}'].astype(str).str.strip().str.lower() 
                        for i in range(len(question['answer']))
                    ]
                    answer_df = pd.concat(answer_dfs, axis=1).agg(list, axis=1)
                    correct_answers = question['answer']
                else:
                    answer_df = answers_df[answer_column].astype(str).str.strip().str.lower()
                    answer_dfs = [answer_df]
                    correct_answers = [question['answer']]

                answer_correct_dfs = []

                for answer_field_df, correct_answer in zip(answer_dfs, correct_answers):
                    if question['type'] == 'text':
                        if isinstance(correct_answer, str):
                            correct_answer = [correct_answer]
                            
                        answer_correct_dfs.append(answer_field_df.isin([str(answer).lower() for answer in correct_answer]))
                    elif question['type'] == 'regex':
                        answer_correct_dfs.append(answer_field_df.str.match(str(correct_answer), case=False))
                answer_correct_df = pd.concat(answer_correct_dfs, axis=1).all(axis=1)

            # Append the checked answers for this question to the DataFrame
            answer_checked_df = answers_df[['participant_ID', 'task']].copy()
            answer_checked_df['question_nr'] = question_nr
            answer_checked_df['dimension'] = question['dimension']
            answer_checked_df['level'] = question['level']
            answer_checked_df['correct'] = answer_correct_df
            answer_checked_df['answer'] = answer_df

            answers_checked_df = pd.concat([answers_checked_df, answer_checked_df])

    return answers_checked_df

# Load coding data
def load_codes(sheet_name, additional_columns = [], code_postfix=None):
    with pd.ExcelFile('data/coding.xlsx') as file:
        codes_df = pd\
            .read_excel(file, sheet_name=sheet_name, usecols=['participant_ID', *additional_columns, 'Codes']).rename(columns={'Codes': 'code'})
            
        codes_df['code'] = codes_df['code'].str.split(',')
        codes_df = codes_df.explode('code')
        codes_df['code'] = codes_df['code'].str.strip()
        codes_df = codes_df[
            (~codes_df['code'].isna()) & 
            (codes_df['code'] != '')
        ].reset_index(drop=True)

        if code_postfix is not None:
            codes_df[['code', code_postfix]] = codes_df['code'].str.split('/', n=1, expand=True)

        code_levels_df = codes_df['code'].str.split(':').apply(pd.Series)
        code_levels_df.columns = [f'code_level_{i + 1}' for i in code_levels_df.columns]
        codes_df = pd.concat([codes_df, code_levels_df], axis=1)

    return codes_df

# Count code distributions per (sub-)category, both relative to the parent category and to the total number of items
def codes_level_count(
    items_df,
    items_columns,
    codes_df,
    levels,
):
    # Include counts per code (category), and frequency relative to parent
    counts = codes_df.groupby(levels).size().reset_index(name=f'count')
    if len(levels) <= 1:
        counts['parent_count'] = len(codes_df)
    else:
        parent_count = codes_df.groupby(levels[:-1]).size().reset_index(name='parent_count')
        counts = counts.merge(parent_count, on=levels[:-1], how='left')

    counts['frequency_parent'] = counts['count'] / counts['parent_count']
    counts = counts.drop(columns=['parent_count'])

    # Include counts of code (category) per item, and frequency relative to item count
    counts_unique = codes_df.drop_duplicates(items_columns + levels).groupby(levels).size().reset_index(name=f'count_unique').fillna(0)
    items_count = len(items_df)
    counts_unique['frequency_unique'] = counts_unique['count_unique'] / items_count
    return counts.merge(counts_unique, on=levels, how='left')

def codes_count(
    items_df,
    items_columns,
    codes_df, 
    group_columns = []
):
    levels = [column for column in codes_df.columns if column.startswith('code_level_')]
    # Include counts per item
    result = pd.DataFrame([{
        'count': len(items_df),
        **{
            f'{group_column}_{group_value}_count': len(items_df[items_df[group_column] == group_value])
            for group_column in group_columns
            for group_value in items_df[group_column].unique()
        }
    }])

    for i in range(len(levels)):
        counts = codes_level_count(
            items_df,
            items_columns,
            codes_df,
            levels[:i+1]
        )

        # Also include counts per group
        for group_column in group_columns:
            for group_value in items_df[group_column].unique():
                items_filtered_df = items_df[items_df[group_column] == group_value]
                counts_filtered = codes_level_count(
                    items_filtered_df,
                    items_columns,
                    items_filtered_df.merge(codes_df, on=items_columns, how='inner'),
                    levels[:i+1]
                )

                columns = {column: f'{group_column}_{group_value}_{column}' for column in ['count', 'frequency_parent', 'count_unique', 'frequency_unique']}

                counts = pd.merge(
                    counts, 
                    counts_filtered.rename(columns=columns), 
                    on=levels[:i+1], 
                    how='left'
                )
                for column in columns.values():
                    counts[column] = counts[column].fillna(0)

        result = pd.concat([
            result, 
            counts
        ], ignore_index=True)

    # Sort the counts per level
    for i, level in enumerate(levels):
        result = pd.merge(
            result, 
            codes_df.groupby(levels[:i + 1]).size().reset_index(name=f'{level}_count'), 
            on=levels[:i + 1], 
            how='left'
        )
    result = result.sort_values(
        by=[column for level in levels for column in [f'{level}_count', level]], 
        ascending=[False, True]*len(levels), 
        na_position='first'
    )
    result = result.drop(columns=[f'{level}_count' for level in levels])

    return result.reset_index(drop=True)

# Create a LaTeX table row for the code distributions
def codes_latex_table_row(
    row,
    levels,
    groups = [],
):
    latex = ''

    for i, level in reversed(list(enumerate(levels))):
        if not pd.isna(row[level]):
            code = row[level].replace('_', ' ').capitalize()
            if i != 0:
                latex += '\\hspace{' + f'{0.3 * i:.1f}' + 'cm} ' + code
            else:
                latex += '\\textbf{' + code + '}'
            break

    latex += ' & '

    values = [(row['count_unique'], row['frequency_unique'])] + [
        (row[f'{group['column']}_{option['value']}_count_unique'], row[f'{group['column']}_{option['value']}_frequency_unique']) 
        for group in groups
        for option in group['options']
    ]

    latex += ' & '.join([
        str(count) + ' & ' + str(frequency * 100) if not pd.isna(frequency)
        else str(count) + ' & '
        for count, frequency in values
    ])

    latex += '\\\\\n'

    return latex

# Create a LaTeX table for the code distributions
def codes_latex_table(
    file,
    items_df,
    items_columns,
    codes_df, 
    groups = [],
):
    counts_df = codes_count(items_df, items_columns, codes_df, [group['column'] for group in groups])
    levels = [column for column in counts_df.columns if column.startswith('code_level_')]
    column_format = 'S[table-format=3, round-mode=places, round-precision=0]S[table-format=2, round-mode=places, round-precision=0]'
    column_header = '\\multicolumn{1}{c}{\\#} & \\multicolumn{1}{c}{\\%}'

    latex = '\\begin{tabular}{l' + ''.join(
        [column_format] +
        ['|' + ''.join([column_format for _ in group['options']]) for group in groups]) + '}\n'
    latex += '\\toprule\n'
    
    latex += '\\multicolumn{1}{c}{} & ' + ' & '.join(
        ['\\multicolumn{2}{c}{Total}'] + 
        ['\\multicolumn{2}{c}{' + option['title'] + '}' for group in groups for option in group['options']]) + '\\\\\n'
    
    latex += '\\midrule\n'

    latex += '\\textbf{Total} & '
    total_row = counts_df.iloc[0]

    values = [total_row['count']] + [
        total_row[f'{group['column']}_{option['value']}_count']
        for group in groups
        for option in group['options']
    ]
    
    latex += ' & '.join(['\\multicolumn{2}{c}{' + str(int(value)) + '}' for value in values]) + '\\\\\n'

    latex += '\\midrule\n'

    latex += 'Codes & ' + ' & '.join(
        [column_header] + 
        [column_header for group in groups for _ in group['options']]) + '\\\\\n'
    latex += '\\midrule\n'

    for _, row in counts_df.iterrows():
        if not pd.isna(row[levels[0]]):
            latex += codes_latex_table_row(
                row, 
                levels,
                groups
            )

    latex += '\\bottomrule\n'

    latex += '\\end{tabular}'

    with open(file, 'w') as file:
        file.write(latex)

# Plot the code distributions
def plot_codes_bars(file, participants_df, codes_count_df, categories, index_order, index_labels, cluster=None):
    codes_count_df = codes_count_df.rename(columns={'code_level_1': 'category', 'code_level_2': 'code'})

    palettes = [
        'Blues',
        'Oranges',
        'Greens',
        'Purples',
    ]

    sns.set(style='whitegrid')
    for i, category in enumerate(categories):
        fig, ax = plt.subplots(figsize=(10, 4))
        fig.set_tight_layout(True)

        category_code = category['code']
        stat = category['stat']
        groups = category['groups']
        codes = [code for group in groups for code in group]

        group_palettes = [list(reversed(sns.palettes.color_palette(palettes[i], len(group)))) for i, group in enumerate(groups)]
        colors = [group_palettes[i][j] for i, group in enumerate(groups) for j in range(len(group))]

        # Format and sort data
        category_df = codes_count_df[
            (codes_count_df['category'] == category_code)
            & ~pd.isna(codes_count_df['code'])
        ].rename(columns={
            **{
                f'participant_ID_{participant_ID}_{stat}': participant_ID
                for participant_ID in index_order
            }
        })[index_order + ['code']].melt(
            id_vars='code',
            var_name='participant_ID',
            value_name=stat
        )

        category_df['participant_ID'] = pd.Categorical(category_df['participant_ID'], index_order, ordered=True)    
        category_df = category_df.pivot_table(
            index=['participant_ID'],
            columns='code',
            values=stat,
            sort=False,
            observed=True,
        ).reset_index().sort_values('participant_ID')

        if cluster is not None:
            cluster_participant_IDs = set(participants_df[
                participants_df[cluster['column']] == cluster['value']
            ]['participant_ID'] if 'column' in cluster else participants_df['participant_ID'])
            cluster_data = category_df[['participant_ID']].copy()
            cluster_data[cluster['title']] = cluster_data['participant_ID'].apply(lambda x: 1 if x in cluster_participant_IDs else 0)
            cluster_data.set_index('participant_ID').plot(kind='bar', width=1.01, edgecolor='none', ax=ax, color='#bbb')

        data = category_df.set_index('participant_ID')[codes].rename(columns={
            code: code.replace('_', ' ').capitalize()
            for code in codes
        })

        data.plot(kind='bar', stacked=True, ax=ax, color=colors)

        fig.suptitle(category['title'], y=1.02)

        ax.set_xlabel(None)
        ax.set_xticks(range(len(index_order)))
        ax.set_xticklabels([
            index_labels[participant_ID] for participant_ID in 
            index_order
        ])

        ax.set_yticks([0, .25, .5, .75, 1])
        ax.set_yticklabels([0, .25, .5, .75, 1])
        ax.set_ylim(0, 1)
        ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f'{x:.0%}'))
        ax.set_ylabel(category['label'])

        ax.grid(axis='y')
        ax.get_legend().remove()

        # Fix legend order
        n_columns = 8
        handles, labels = ax.get_legend_handles_labels()
        if cluster is not None:
            handles = handles[1:]
            labels = labels[1:]
        n_rows = (len(handles) + n_columns - 1) // n_columns

        handles_labels = [
            (handles[i * n_columns + j], labels[i * n_columns + j])
            for j in range(n_columns)
            for i in range(n_rows)
            if i * n_columns + j < len(handles)
        ]

        handles, labels = zip(*handles_labels)
        fig.legend(handles, labels, loc='upper center', bbox_to_anchor=(.5, .97), handlelength=1, handletextpad=0.5, ncol=n_columns)

        plt.savefig(f"{file}_{category['code']}.png", bbox_inches='tight')

# Plot the code distributions
def plot_codes_pie(file, codes_count_df, categories, clusters):
    codes_count_df = codes_count_df.rename(columns={'code_level_1': 'category', 'code_level_2': 'code'})

    palettes = [
        'Blues',
        'Oranges',
        'Greens',
        'Purples',
    ]

    for category in categories:
        sns.set(style='whitegrid')
        fig, axs = plt.subplots(1, len(clusters), figsize=(10, 4))

        category_code = category['code']
        stat = category['stat']
        groups = category['groups']
        codes = [code for group in groups for code in group]

        group_palettes = [list(reversed(sns.palettes.color_palette(palettes[i], len(group)))) for i, group in enumerate(groups)]
        colors = [group_palettes[i][j] for i, group in enumerate(groups) for j in range(len(group))]

        cluster_keys = [f"{cluster['column']}_{cluster['value']}" for cluster in clusters]

        # Format and sort data
        category_df = codes_count_df[
            (codes_count_df['category'] == category_code)
            & ~pd.isna(codes_count_df['code'])
        ].rename(columns={
            **{
                f"{key}_{stat}": key
                for key in cluster_keys
            }
        })[cluster_keys + ['code']].melt(
            id_vars='code',
            var_name='cluster',
            value_name=stat
        )

        category_df = category_df.pivot_table(
            index=['cluster'],
            columns='code',
            values=stat,
            sort=False,
            observed=True,
        ).reset_index()

        for i, cluster in enumerate(clusters):
            key = f"{cluster['column']}_{cluster['value']}"
            data = category_df[category_df['cluster'] == key][codes].iloc[0]
            handles, _, _ = axs[i].pie(
                data,
                colors=colors,
                autopct=lambda p: '{:.0f}%'.format(round(p)) if p > 0 else '', 
                pctdistance=1.2,
                normalize=False,
                textprops={'fontsize': 10},
                counterclock=False,
                startangle=90
            )
            axs[i].set_title(cluster['title'])

        fig.suptitle(category['title'], y=1.06)

        # Fix legend order
        n_columns = 6
        labels = [
            code.replace('_', ' ').capitalize()
            for code in codes
        ]
        n_rows = (len(handles) + n_columns - 1) // n_columns

        handles_labels = [
            (handles[i * n_columns + j], labels[i * n_columns + j])
            for j in range(n_columns)
            for i in range(n_rows)
            if i * n_columns + j < len(handles)
        ]
        handles, labels = zip(*handles_labels)
        fig.legend(handles, labels, loc='upper center', bbox_to_anchor=(.5, 1.02), handlelength=1, handletextpad=0.5, ncol=n_columns)
        fig.set_tight_layout(True)

        plt.savefig(f"{file}_{category['code']}.png", bbox_inches='tight')

def compare_evaluation(evaluations_df, participants_no_interaction, compare, column, test):
    comparison_df = evaluations_df.sort_values('participant_ID')
    
    if compare == 'model':
        comparison_df = comparison_df[~comparison_df['participant_ID'].isin(participants_no_interaction)]
        a = 'control'
        b = 'tom'
    elif compare == 'task':
        a = 'natural-language-processing'
        b = 'data-analysis'
    else:
        raise ValueError(f"Unknown compare column '{compare}'")

    a_df = comparison_df[comparison_df[compare] == a].reset_index(drop=True)[column]
    b_df = comparison_df[comparison_df[compare] == b].reset_index(drop=True)[column]

    return {
        a: a_df.describe(),
        b: b_df.describe(),
        'test': test(a_df, b_df)
    }

