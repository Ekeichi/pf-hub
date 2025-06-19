from sqlalchemy import Column, Integer, Float, String, Text, BigInteger, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()

class StravaActivity(Base):
    __tablename__ = "strava_activities"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(BigInteger, index=True)
    activity_id = Column(BigInteger, unique=True, index=True)
    name = Column(String)
    type = Column(String)
    start_date = Column(DateTime)
    distance = Column(Float)
    moving_time = Column(Integer)
    elapsed_time = Column(Integer)
    total_elevation_gain = Column(Float)
    average_speed = Column(Float)
    max_speed = Column(Float)
    average_heartrate = Column(Float, nullable=True)
    max_heartrate = Column(Float, nullable=True)
    calories = Column(Float, nullable=True)
    segments = Column(Text, nullable=True)      # JSON string
    best_efforts = Column(Text, nullable=True)      # JSON string
    elevation_data = Column(Text, nullable=True)    # JSON string
    pace_data = Column(Text, nullable=True)         # JSON string
    heartrate_data = Column(Text, nullable=True)    # JSON string
    power_data = Column(Text, nullable=True)        # JSON string
    weighted_average_watts = Column(Float, nullable=True)
    max_watts = Column(Float, nullable=True)
    kilojoules = Column(Float, nullable=True)
    device_watts = Column(Boolean, default=False)
    suffer_score = Column(Float, nullable=True)