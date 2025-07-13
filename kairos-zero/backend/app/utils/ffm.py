import sys
import os
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Ajouter le répertoire backend au PYTHONPATH
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(os.path.dirname(current_dir))  # Remonte de utils -> app -> backend
sys.path.insert(0, backend_dir)

# Changer le répertoire de travail pour que le chemin relatif de la DB fonctionne
os.chdir(backend_dir)

from app.database import SessionLocal
from sqlalchemy import text

def clean_nan_values(data_list):
    """Remplace les valeurs NaN par None pour la sérialisation JSON"""
    cleaned = []
    for value in data_list:
        if pd.isna(value) or np.isnan(value):
            cleaned.append(None)
        else:
            cleaned.append(float(value))
    return cleaned

def ACWR(df):
    df = df.sort_values("start_date")
    df["Charge_aigue"] = df["effort_score"].rolling(window=7, min_periods=1).mean()
    df["Charge_chronique"] = df["effort_score"].rolling(window=28, min_periods=1).mean()
    df["Ratio_AC"] = df["Charge_aigue"] / df["Charge_chronique"]
    return df

def fatigue(fatigue_pre, effort):
    tau = 15
    fatigue_post = (effort + np.exp(-1/tau)*fatigue_pre) 
    return fatigue_post

def fitness(fitness_pre, effort):
    tau = 45
    tau_prime = 5
    fitness_post = effort + (np.exp(-1/tau)) * fitness_pre
    return fitness_post

def fatigue_fitness(fatigue_pre, fitness_pre, effort):
    fatigue_post = fatigue(fatigue_pre, effort)
    fitness_post = fitness(fitness_pre, effort)
    return fatigue_post, fitness_post

def forme(fitness_pre, fatigue_pre, effort):
    instant_forme = fitness(fitness_pre, effort) - 2*fatigue(fatigue_pre, effort)
    return instant_forme

def performance(fitness_pre, fatigue_pre, effort):
    instant_performance = (fitness(fitness_pre, effort) - fatigue(fatigue_pre, effort))/2
    return instant_performance

def rapport(fatigue_pre, performance):
    if performance > 0:
        rapport = (fatigue_pre/performance)*100
    elif performance == 0:
        rapport = 150
    else:
        rapport = 150
    return rapport

def courbe_ffm(df):
    courbe_fatigue = []
    courbe_fitness = []
    courbe_performance = []
    courbe_forme = []
    courbe_rapport = []
    fatigue_pre = 0
    fitness_pre = 0
    for i in range(len(df)):
        instant_fatigue = fatigue(fatigue_pre, df.iloc[i]['effort_score'])
        instant_fitness = fitness(fitness_pre, df.iloc[i]['effort_score'])
        instant_performance = performance(fitness_pre, fatigue_pre, df.iloc[i]['effort_score'])
        instant_forme = forme(fitness_pre, fatigue_pre, df.iloc[i]['effort_score'])
        instant_rapport = rapport(fatigue_pre, instant_performance)
        fatigue_pre, fitness_pre = fatigue_fitness(instant_fatigue, instant_fitness, df.iloc[i]['effort_score'])
        courbe_fatigue.append(instant_fatigue)
        courbe_fitness.append(instant_fitness)
        courbe_performance.append(instant_performance)
        courbe_forme.append(instant_forme)
        courbe_rapport.append(instant_rapport)
    return courbe_fatigue, courbe_fitness, courbe_performance, courbe_forme, courbe_rapport, fatigue_pre, fitness_pre

