import sqlite3
import pandas as pd
import streamlit as st
import folium
from streamlit_folium import st_folium


# 1. მონაცემების ჩატვირთვა
def load_data():
    conn = sqlite3.connect(r"D:\E\E&FF\0. CODES\1. DB\data.db")
    df = pd.read_sql_query("SELECT * FROM Users", conn)
    conn.close()
    return df


# 2. კითხვის ანალიზი
def process_query(query, df):
    query = query.lower()

    if "tank" in query:
        return df[df["object"] == "tank3"]
    elif "missile" in query:
        return df[df["object"] == "missile"]
    elif "air" in query or "air_defense" in query:
        return df[df["object"] == "air_defense"]
    elif "how many" in query or "რამდენი" in query:
        return f"სულ ობიექტი: {df.shape[0]}"
    elif "all" in query or "ყველა" in query:
        return df
    else:
        return "კითხვა ვერ გავიგე. სცადე: tank, missile, air, how many, all"


# 3. რუკის შექმნა
def create_map(df):
    m = folium.Map(location=[50, 35], zoom_start=4)

    colors = {"tank3": "blue", "missile": "red", "air_defense": "green"}

    for _, row in df.iterrows():
        color = colors.get(row["object"], "gray")
        folium.CircleMarker(
            location=[float(row["latitude"]), float(row["longitude"])],
            radius=8,
            color=color,
            fill=True,
            fill_color=color,
            popup=f"{row['object']} | {row['date']}"
        ).add_to(m)

    return m


# 4. Streamlit ინტერფეისი
def main():
    st.title("🎯 Military Data System")
    st.markdown("---")

    df = load_data()

    # გვერდები
    tab1, tab2, tab3 = st.tabs(["🔍 ძიება", "🗺️ რუკა", "📊 მონაცემები"])

    # ძიების გვერდი
    with tab1:
        st.subheader("დასვი კითხვა")
        question = st.text_input("კითხვა", placeholder="მაგ: show missile, how many, all...", label_visibility="collapsed")

        if st.button("🔍 ძიება"):
            if question:
                result = process_query(question, df)
                st.markdown("### შედეგი:")
                if isinstance(result, str):
                    st.info(result)
                else:
                    st.dataframe(result)
            else:
                st.warning("დაწერე კითხვა!")

    # რუკის გვერდი
    with tab2:
        st.subheader("ობიექტების რუკა")
        st.markdown("🔴 missile | 🔵 tank | 🟢 air_defense")
        m = create_map(df)
        st_folium(m, width=700, height=500)

    # მონაცემების გვერდი
    with tab3:
        st.subheader("ყველა მონაცემი")
        st.dataframe(df)


main()

