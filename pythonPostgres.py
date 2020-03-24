import psycopg2

connection = psycopg2.connect(
    host="10.0.0.78",
    database="postgres",
    user="postgres",
    password="Keilly2020COVID19"
)

# creating cursor
cur = connection.cursor()

# inserting into table
cur.execute("insert into video_library (vid, primary_category, sub_category, length) values (%s, %s, %s, %s)",
            (333, "sport", "football", 120))

# executing query
cur.execute("select vid from video_library")

# fetching all vid rows
rows = cur.fetchall()

for r in rows:
    print({r[0]})

# commit changes to connection (only if you modify database)
connection.commit()

# closing cursor
cur.close()

# closing the connection
connection.close()

# testing
msg = "Hello World"
print(msg)
