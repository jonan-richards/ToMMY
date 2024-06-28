import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

student_files = [doc for doc in os.listdir() if doc.endswith('.txt')]
student_texts = [open(_file, encoding='utf-8').read()
                 for _file in student_files]

def vectorize(Text): 
    return TfidfVectorizer().fit_transform(Text).toarray()

vectors = vectorize(student_texts)

def similarity(doc1, doc2): 
    return cosine_similarity([doc1, doc2])

s_vectors = list(zip(student_files, vectors))
threshold = 0.9
comparisons = set()

for student_a, text_vector_a in s_vectors:
    new_vectors = s_vectors.copy()

    current_index = new_vectors.index((student_a, text_vector_a))
    del new_vectors[current_index]

    for student_b, text_vector_b in new_vectors:
        sim_score = similarity(text_vector_a, text_vector_b)[0][1]
        student_pair = sorted((student_a, student_b))
        match = sim_score > threshold
        comparison = (*student_pair, sim_score, match)
        comparisons.add(comparison)

print(comparisons)