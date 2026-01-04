# PM2.5 Spatiotemporal Analysis and Energy Consumption Correlation in Tamil Nadu (2018–2022)

This repository presents a comprehensive **air pollution monitoring and analysis project** using **Google Earth Engine (GEE)** to estimate **PM2.5 concentrations across major cities in Tamil Nadu, India**, for the period **2018–2022**. The derived pollution metrics are further used to establish a **correlation with electrical energy consumption**, leading to the formulation of a constant representing their relationship.

---

## 📌 Project Objective

The primary objectives of this project are:

- To estimate **city-level PM2.5 concentrations** across Tamil Nadu using satellite observations.
- To analyze **temporal variations** (yearly, monthly, and weekly) in PM2.5 levels from 2018 to 2022.
- To identify **undermonitored urban regions** with consistently high pollution levels.
- To establish a **correlation between PM2.5 concentration and electrical energy consumption**, and derive a representative constant linking the two.
- To support **data-driven environmental and energy policy insights**.

---

## 🌍 Study Area

- **Region:** Tamil Nadu, India  
- **Spatial Resolution:** ~1 km  
- **Analysis Units:** City-level boundaries  

Administrative boundaries are extracted using FAO GAUL datasets, and city locations are defined using a custom feature collection.

---

## 🛰️ Data Source

- **Satellite Platform:** Sentinel-5P  
- **Instrument:** TROPOMI  
- **Dataset:**  
  `COPERNICUS/S5P/OFFL/L3_NO2`  

> **Note:**  
> Tropospheric NO₂ column density is used as a **proxy indicator** for PM2.5 due to its strong correlation with fine particulate pollution in urban and industrial regions.

All datasets are accessed directly from the **Google Earth Engine Data Catalog**.  
No raw satellite data is stored in this repository.

---

## 🛠️ Tools & Technologies

- **Google Earth Engine (JavaScript API)**
- **Remote Sensing & Geospatial Analysis**
- **Spatiotemporal Statistical Analysis**
- **Data Export & Post-processing (CSV)**
- **Correlation Analysis with Energy Consumption Data**

---

## 🔍 Methodology Overview

1. **Data Filtering**
   - Sentinel-5P imagery filtered by date (2018–2022).
   - Spatial clipping to Tamil Nadu boundary.

2. **Temporal Aggregation**
   - Yearly mean PM2.5 proxy values.
   - Monthly and weekly averages for detailed trend analysis.

3. **City-Level Estimation**
   - Mean PM2.5 values extracted for each city using spatial reducers.
   - Identification of **undermonitored cities** with consistently elevated pollution.

4. **Visualization & UI**
   - Interactive map layers for each year.
   - City-wise statistics panel.
   - Time-series charts generated on city selection.

5. **Correlation Analysis**
   - PM2.5 estimates correlated with **electrical energy consumption data**.
   - Derivation of a constant expressing the relationship between pollution levels and energy usage.

---

## ✨ Key Features

- City-level PM2.5 estimation across Tamil Nadu
- Yearly, monthly, and weekly temporal analysis
- Interactive UI panels and charts in GEE
- Highlighting of undermonitored cities
- Exportable datasets for further statistical analysis
- Integration-ready outputs for energy–environment correlation studies

---


## ▶️ How to Run the Project

1. Open **Google Earth Engine Code Editor**  
   https://code.earthengine.google.com/

2. Create a new script.

3. Copy the contents of `pm25_analysis.js` from this repository and paste it into the editor.

4. Ensure access to the required **city boundary asset**.

5. Click **Run** to visualize PM2.5 layers and interact with the UI.

6. Use the **Export** options to generate CSV files for offline analysis.

---

## 📊 Outputs

- Yearly PM2.5 estimates (2018–2022)
- Monthly PM2.5 values for all cities
- Weekly PM2.5 values for high-resolution trend analysis
- City-wise pollution statistics
- Time-series pollution trends
- Exported CSV datasets for correlation and modeling

---

## 📌 Applications

- Urban air quality assessment
- Environmental impact studies
- Energy consumption and pollution correlation analysis
- Smart city and sustainability planning
- Academic research and policy support

---

## ⚠️ Limitations

- PM2.5 values are **proxy-based estimates** derived from NO₂ observations.
- Satellite-derived values may differ from ground-based sensor measurements.
- Energy consumption data correlation depends on external datasets and assumptions.

---

## 📄 License

This project is intended for **academic, research, and educational use** only.

---

## 👤 Author

Developed as part of a geospatial air quality and energy correlation study using Google Earth Engine.


