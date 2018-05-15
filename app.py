################################################
# Dependencies
################################################

import numpy as np
import pandas as pd

# SQL Alchemy (ORM)
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect, func, desc

# flask (server)
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################
from flask_sqlalchemy import SQLAlchemy
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///DataSets/belly_button_biodiversity.sqlite"

db = SQLAlchemy(app)

engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite")
inspector = inspect(engine)
Base = automap_base()
Base.prepare(engine, reflect = True)

class otu(db.Model):
    __tablename__ = "otu"
    otu_id = db.Column(db.Integer, primary_key=True)
    lowest_taxonomic_unit_found = db.Column(db.Text)

class metadata(db.Model):
    __tablename__="samples_metadata"
    sampleid = db.Column(db.Integer, primary_key=True)
    event = db.Column(db.Text)
    ethnicity = db.Column(db.Text)
    gender = db.Column(db.Text)
    age = db.Column(db.Integer)
    wfreq = db.Column(db.Integer)
    bbtype = db.Column(db.Text)
    location = db.Column(db.Text)
    country012 = db.Column(db.Text)
    zip012 = db.Column(db.Text)
    country1319 = db.Column(db.Text)
    zip1319 = db.Column(db.Integer)
    dog = db.Column(db.Text)
    cat = db.Column(db.Text)
    impsurface013 = db.Column(db.Integer)
    npp013 = db.Column(db.Float)
    mmaxtemp013 = db.Column(db.Float)
    pfc013 = db.Column(db.Float)
    impsurface1319 = db.Column(db.Integer)
    npp1319 = db.Column(db.Float)
    mmaxtemp1319 = db.Column(db.Float)
    pfc1319 = db.Column(db.Float)

Samples = Base.classes.samples

session = Session(engine)

#################################################
# Flask Routes
#################################################

# query the database and send the jsonified results

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/names")
def names():
    sampleNames = []
    for field in inspector.get_columns(table_name = "samples"):
        sampleNames.append(field["name"])
    return jsonify(sampleNames)

@app.route("/otu")
def otuList():
    results = session.query(otu.lowest_taxonomic_unit_found).all()
    otu_list = list(np.ravel(results))
    return jsonify(otu_list)
    #results = db.session.query(otu.lowest_taxonomic_unit_found).all()
    #df = pd.DataFrame(results)
    #return jsonify(df.to_dict(orient="records"))

@app.route("/metadata/<sample>")
def sample_metadata(sample):
    sel = [metadata.sampleid, 
           metadata.ethnicity,
           metadata.gender, 
           metadata.age,
           metadata.location, 
           metadata.bbtype]
    
    results = session.query(*sel).\
        filter(metadata.sampleid == sample[3:]).all()

    sample_metadata = {}
    for result in results:
        sample_metadata["sampleid"] = result[0]
        sample_metadata["ethnicity"] = result[1]
        sample_metadata["gender"] = result[2]
        sample_metadata["age"] = result[3]
        sample_metadata["location"] = result[4]
        sample_metadata["bbtype"] = result[5]
    
    return jsonify(sample_metadata)

@app.route("/wfreq/<sample>")
def sample_wfreq(sample):
    sel = [metadata.sampleid,
           metadata.wfreq]
    
    results = session.query(*sel).\
        filter(metadata.sampleid == sample[3:]).all()

    sample_wfreq = {}
    for result in results:
        sample_wfreq["sampleid"] = result[0]
        sample_wfreq["wfreq"] = result[1]

    return jsonify(sample_wfreq)

@app.route('/samples/<sample>')
def samples(sample):
    sample_query = 'Samples.' + sample
    samples_result = session.query(Samples.otu_id,sample_query).order_by(desc(sample_query))   

    otu_ids = []
    sample_values = []

    sample_collection = {}
    for result in samples_result:
        otu_ids.append(result[0])
        sample_values.append(result[1])

        sample_collection = [{
            'otu_ids': otu_ids,
            'sample_values': sample_values
        }]

        return jsonify(sample_collection)

if __name__ == "__main__":
    app.run(debug=True)
