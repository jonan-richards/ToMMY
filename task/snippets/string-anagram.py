from collections import defaultdict

def xxxxx(first_str: str, second_str: str) -> bool:
    first_str = first_str.lower().strip()
    second_str = second_str.lower().strip()

    first_str = first_str.replace(" ", "")
    second_str = second_str.replace(" ", "")

    if len(first_str) != len(second_str):
        return False
    
    count: defaultdict[str, int] = defaultdict(int)

    for i in range(len(first_str)):
        count[first_str[i]] += 1
        count[second_str[i]] -= 1

    return all(_count == 0 for _count in count.values())