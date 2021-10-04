import sys
data = sys.stdin.readline()  #標準入力からデータを取得する
num=int(data)

def sum(a):
    return a+3

print(sum(num)) #print()の内容がjsに引き渡される。