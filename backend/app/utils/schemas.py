from marshmallow import Schema, fields, validate, ValidationError


class MovieSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    overview = fields.Str(allow_none=True)
    poster_url = fields.Str(allow_none=True)
    genre = fields.Str(allow_none=True)
    year = fields.Int(allow_none=True)
    rating = fields.Float(allow_none=True)
    duration = fields.Str(allow_none=True)
    tmdb_id = fields.Int(allow_none=True)


class UserSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=1, max=120))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))


class ProfileUpdateSchema(Schema):
    username = fields.Str(validate=validate.Length(min=1, max=120))
    favorite_club = fields.Str(allow_none=True)


class ReviewSchema(Schema):
    user_id = fields.Int(required=True)
    movie_title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    text = fields.Str(required=True, validate=validate.Length(min=1, max=2000))
    poster_url = fields.Str(allow_none=True)


class PredictionSchema(Schema):
    fixture_id = fields.Int(required=True)
    predicted_winner_id = fields.Int(allow_none=True)
    confidence = fields.Int(required=True, validate=validate.Range(min=0, max=100))


class TeamSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    code = fields.Str(allow_none=True)
    league = fields.Str(allow_none=True)
    stadium = fields.Str(allow_none=True)
    rating_score = fields.Float(allow_none=True)


class FixtureSchema(Schema):
    team_home_id = fields.Int(required=True)
    team_away_id = fields.Int(required=True)
    match_date = fields.Str(required=True)
    status = fields.Str(allow_none=True)