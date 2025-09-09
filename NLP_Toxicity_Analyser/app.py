from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

#lightweight toxicity classifier
classifier = pipeline("text-classification", model="unitary/toxic-bert", return_all_scores=True)

@app.route("/moderate", methods=["POST"])
def moderate():
    data = request.json
    post = data.get("text", "")

    results = classifier(post)
    flagged = [r for r in results[0] if r["score"] > 0.6]

    return jsonify({
        "allowed": len(flagged) == 0,
        "flagged": flagged
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
