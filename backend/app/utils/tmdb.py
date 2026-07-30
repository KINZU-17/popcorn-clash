import requests
from flask import current_app


class TMDBClient:
    def __init__(self, api_key: str = "", base_url: str = "https://api.themoviedb.org/3"):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({"Accept": "application/json"})

    def _get(self, path: str, params: dict | None = None) -> dict | None:
        if not self.api_key:
            return None
        url = f"{self.base_url}{path}"
        params = {**(params or {}), "api_key": self.api_key}
        try:
            resp = self.session.get(url, params=params, timeout=10)
            resp.raise_for_status()
            return resp.json()
        except requests.RequestException:
            return None

    def search_movies(self, query: str, page: int = 1) -> dict | None:
        return self._get("/search/movie", {"query": query, "page": page})

    def get_movie(self, tmdb_id: int) -> dict | None:
        return self._get(f"/movie/{tmdb_id}")

    def get_popular(self, page: int = 1) -> dict | None:
        return self._get("/movie/popular", {"page": page})

    def get_genres(self) -> dict | None:
        return self._get("/genre/movie/list")


def get_tmdb_client() -> TMDBClient:
    api_key = current_app.config.get("TMDB_API_KEY", "")
    base_url = current_app.config.get("TMDB_BASE_URL", "https://api.themoviedb.org/3")
    return TMDBClient(api_key=api_key, base_url=base_url)