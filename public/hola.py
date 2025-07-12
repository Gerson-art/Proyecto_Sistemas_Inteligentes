from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier
from sklearn import tree
import matplotlib.pyplot as plt

X, y = load_iris(return_X_y=True)
clf = DecisionTreeClassifier(max_depth=3)
clf.fit(X, y)

plt.figure(figsize=(12,8))
tree.plot_tree(clf, filled=True)
plt.show()