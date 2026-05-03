from pathlib import Path
import json

import pandas as pd

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


ROOT = Path("/Users/admin55/Downloads/DS-shopping")
SCRATCH = ROOT / "presentation-workspace" / "scratch"
ASSETS = SCRATCH / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)


def sentiment_from_score(score: int) -> str:
    if score >= 4:
        return "Positive"
    if score == 3:
        return "Neutral"
    return "Negative"


frames = []
for path in sorted((ROOT / "csv").glob("*.csv")):
    frame = pd.read_csv(path)
    frame["source_file"] = path.name
    frames.append(frame)

df = pd.concat(frames, ignore_index=True)
clean = df.dropna(subset=["content", "score"]).copy()
clean["score"] = clean["score"].astype(int)
clean["sentiment"] = clean["score"].map(sentiment_from_score)
clean["review_length"] = clean["content"].astype(str).str.len()

app_summary = (
    clean.groupby("appName")
    .agg(
        reviews=("content", "size"),
        avg_score=("score", "mean"),
        avg_review_length=("review_length", "mean"),
        thumbs_up=("thumbsUpCount", "sum"),
    )
    .reset_index()
)
sentiment_counts = clean.groupby(["appName", "sentiment"]).size().unstack(fill_value=0)
sentiment_share = sentiment_counts.div(sentiment_counts.sum(axis=1), axis=0)

top_avg = app_summary.sort_values("avg_score", ascending=False).head(5)
bottom_avg = app_summary.sort_values("avg_score").head(5)
overall_sentiment = clean["sentiment"].value_counts(normalize=True).mul(100).round(1).to_dict()

metrics = {
    "total_csv_rows": int(len(df)),
    "clean_review_rows": int(len(clean)),
    "app_count": int(clean["appName"].nunique()),
    "columns": list(clean.columns[:8]),
    "top_apps_by_rating": [
        {"app": row.appName, "avg_score": round(float(row.avg_score), 2), "reviews": int(row.reviews)}
        for row in top_avg.itertuples()
    ],
    "lowest_apps_by_rating": [
        {"app": row.appName, "avg_score": round(float(row.avg_score), 2), "reviews": int(row.reviews)}
        for row in bottom_avg.itertuples()
    ],
    "overall_sentiment_percent": overall_sentiment,
    "largest_app": str(app_summary.sort_values("reviews", ascending=False).iloc[0]["appName"]),
    "largest_app_reviews": int(app_summary.sort_values("reviews", ascending=False).iloc[0]["reviews"]),
    "missing_reply_percent": round(float(clean["replyContent"].isna().mean() * 100), 1),
}

(SCRATCH / "project_metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")

plt.rcParams.update({
    "figure.facecolor": "white",
    "axes.facecolor": "white",
    "axes.edgecolor": "#35415F",
    "axes.labelcolor": "#172033",
    "xtick.color": "#172033",
    "ytick.color": "#172033",
    "font.size": 10,
})

fig, ax = plt.subplots(figsize=(10, 5.8), dpi=180)
ranked = app_summary.sort_values("avg_score")
colors = ["#ef476f" if v < 2.5 else "#ffd166" if v < 3.5 else "#06d6a0" for v in ranked["avg_score"]]
ax.barh(ranked["appName"], ranked["avg_score"], color=colors)
ax.set_xlim(0, 5)
ax.set_xlabel("Average rating")
ax.set_title("Average User Rating by Shopping App", fontsize=14, weight="bold")
for i, value in enumerate(ranked["avg_score"]):
    ax.text(value + 0.05, i, f"{value:.2f}", va="center", fontsize=9)
ax.grid(axis="x", alpha=0.2)
fig.tight_layout()
fig.savefig(ASSETS / "average_rating_by_app.png", bbox_inches="tight")
plt.close(fig)

ordered = sentiment_share.sort_values("Positive", ascending=False)
fig, ax = plt.subplots(figsize=(10, 5.8), dpi=180)
left = [0] * len(ordered)
palette = {"Positive": "#06d6a0", "Neutral": "#ffd166", "Negative": "#ef476f"}
for sentiment in ["Positive", "Neutral", "Negative"]:
    vals = ordered[sentiment] * 100
    ax.barh(ordered.index, vals, left=left, label=sentiment, color=palette[sentiment])
    left = [l + v for l, v in zip(left, vals)]
ax.set_xlim(0, 100)
ax.set_xlabel("Share of reviews (%)")
ax.set_title("Rating-Derived Sentiment Mix by App", fontsize=14, weight="bold")
ax.legend(loc="lower right", ncols=3, frameon=False)
ax.grid(axis="x", alpha=0.16)
fig.tight_layout()
fig.savefig(ASSETS / "sentiment_mix_by_app.png", bbox_inches="tight")
plt.close(fig)

cluster_like = clean.groupby("sentiment").agg(
    avg_length=("review_length", "mean"),
    count=("content", "size"),
).reindex(["Positive", "Neutral", "Negative"])
fig, ax = plt.subplots(figsize=(9.8, 5.5), dpi=180)
bars = ax.bar(cluster_like.index, cluster_like["avg_length"], color=["#06d6a0", "#ffd166", "#ef476f"])
ax.set_ylabel("Average review length (characters)")
ax.set_title("Review Length Changes with Sentiment", fontsize=14, weight="bold")
for bar, count in zip(bars, cluster_like["count"]):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 3, f"{int(count):,} reviews", ha="center", fontsize=9)
ax.grid(axis="y", alpha=0.2)
fig.tight_layout()
fig.savefig(ASSETS / "review_length_by_sentiment.png", bbox_inches="tight")
plt.close(fig)
