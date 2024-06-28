import os
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime
sns.set(style="white")

data_path = os.path.join(os.getcwd(), '..', 'data')

raw_data_path = data_path + "/autos.csv"
clean_data_path = data_path + "/cleaned_autos.csv"

df = pd.read_csv(raw_data_path,encoding="latin-1")

df["vehicleType"] = df["vehicleType"].fillna("Other")
df["offerType"] = df["offerType"].map({'Gesuch':"Request",'Angebot':'Offer'})

df = df[(df["yearOfRegistration"] >= 1890) & (df["yearOfRegistration"] <= 2016)]

_median = df.groupby("vehicleType")["price"].median()
_quantile75 = df.groupby("vehicleType")["price"].quantile(0.75)
_quantile25 = df.groupby("vehicleType")["price"].quantile(0.25)
iqr = (_quantile75 - _quantile25)*1.5 + _median

df = df[((df["vehicleType"] == "andere") & (df["price"] <= iqr["andere"])) |
        ((df["vehicleType"] == "Other") & (df["price"] <= iqr["Other"])) |
        ((df["vehicleType"] == "suv") & (df["price"] <= iqr["suv"])) |
        ((df["vehicleType"] == "kombi") & (df["price"] <= iqr["kombi"])) |
        ((df["vehicleType"] == "bus") & (df["price"] <= iqr["bus"])) |
        ((df["vehicleType"] == "cabrio") & (df["price"] <= iqr["cabrio"])) |
        ((df["vehicleType"] == "limousine") & (df["price"] <= iqr["limousine"])) |
        ((df["vehicleType"] == "coupe") & (df["price"] <= iqr["coupe"])) |
        ((df["vehicleType"] == "kleinwagen") & (df["price"] <= iqr["kleinwagen"]))]

df["fuelType"] = df["fuelType"].fillna("other")
df["fuelType"] = df["fuelType"].map({'benzin':'Gasoline','diesel':'Diesel','other':'Other','lpg':'Lpg','hybrid':'Hybrid','cng':'Cng','elektro':'Electric'})

df.to_csv(clean_data_path,index=False)

df = pd.read_csv(clean_data_path,encoding="latin-1")

trial = pd.DataFrame()
for b in list(df["brand"].unique()):
    for v in list(df["vehicleType"].unique()):
        z = df[(df["brand"] == b) & (df["vehicleType"] == v)]["price"].mean()
        trial = pd.concat([trial, pd.DataFrame([{'brand':b , 'vehicleType':v , 'avgPrice':z}])], ignore_index=True)
trial["avgPrice"] = trial["avgPrice"].fillna(0)
trial["avgPrice"] = trial["avgPrice"].astype(int)

tri = trial.pivot(index="brand",columns="vehicleType", values="avgPrice")
fig, ax = plt.subplots(figsize=(15,20))
sns.heatmap(tri,linewidths=1,cmap="YlGnBu",annot=True, ax=ax, fmt="d")
plt.show()