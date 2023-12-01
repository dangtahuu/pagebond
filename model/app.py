from flask import Flask, request, jsonify
import pickle
import numpy as np
# import joblib  # Assuming you meant joblib, but you can replace it with your pickle library

app = Flask(__name__)

model = pickle.load(open('data/model.pkl','rb'))
book_names = pickle.load(open('data/book_names.pkl','rb'))
final_rating = pickle.load(open('data/final_rating.pkl','rb'))
book_pivot = pickle.load(open('data/book_pivot.pkl','rb'))

def recommend_book(book_name):
    books_list = []
    book_id = np.where(book_pivot.index == book_name)[0][0]
    distance, suggestion = model.kneighbors(book_pivot.iloc[book_id,:].values.reshape(1,-1), n_neighbors=6 )

    # poster_url = fetch_poster(suggestion)
    
    for i in range(len(suggestion)):
            books = book_pivot.index[suggestion[i]]
            for j in books:
                books_list.append(j)
    return books_list     

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
      
        # Make predictions
        result = recommend_book(data['book_name'])

        # Return the result as JSON
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
