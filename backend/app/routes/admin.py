import os
import json
from flask import Blueprint, g
from flask_restful import Resource, Api, reqparse
from app.utils.auth import admin_required
from app.utils.logger import logger
from app.database.queries import (
    get_stats,
    update_user_role,
    delete_user,
    delete_review as db_delete_review,
    delete_movie as db_delete_movie,
    update_user_ban_status,
    search_users_admin,
    get_recent_activity,
    delete_expired_password_resets,
)

from app.database import queries

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")
api = Api(admin_bp)


class AdminStatsResource(Resource):
    @admin_required
    def get(self):
        logger.info("admin.stats.get", admin_user_id=g.user.get('id'), admin_email=g.user.get('email'))
        stats = get_stats()
        return {"stats": stats}


class AdminUserRoleResource(Resource):
    @admin_required
    def patch(self, user_id):
        # In a real app, you'd get the new role from the request body
        # For this implementation, we'll just toggle between 'admin' and 'member'
        from app.database.queries import get_user_by_id
        user = get_user_by_id(user_id)
        if not user:
            return {"error": "User not found"}, 404
        
        new_role = 'member' if user.get('role') == 'admin' else 'admin'
        update_user_role(user_id, new_role)
        logger.info(
            "admin.user.role.patch",
            admin_user_id=g.user.get('id'),
            admin_email=g.user.get('email'),
            target_user_id=user_id,
            new_role=new_role
        )
        return {"message": f"User role updated to {new_role}", "new_role": new_role}


class AdminUserResource(Resource):
    @admin_required
    def delete(self, user_id):
        delete_user(user_id)
        logger.info(
            "admin.user.delete",
            admin_user_id=g.user.get('id'),
            admin_email=g.user.get('email'),
            deleted_user_id=user_id
        )
        return {"message": "User and all their associated data have been deleted."}


class AdminReviewResource(Resource):
    @admin_required
    def delete(self, review_id):
        db_delete_review(review_id)
        logger.info(
            "admin.review.delete",
            admin_user_id=g.user.get('id'),
            admin_email=g.user.get('email'),
            deleted_review_id=review_id
        )
        return {"message": "Review deleted successfully."}


class AdminMovieResource(Resource):
    @admin_required
    def delete(self, movie_id):
        db_delete_movie(movie_id)
        logger.info(
            "admin.movie.delete",
            admin_user_id=g.user.get('id'),
            admin_email=g.user.get('email'),
            deleted_movie_id=movie_id
        )
        return {"message": "Movie deleted successfully."}


class AdminUserBanResource(Resource):
    @admin_required
    def patch(self, user_id):
        parser = reqparse.RequestParser()
        parser.add_argument("is_banned", type=bool, required=True, help="is_banned is required")
        args = parser.parse_args()

        from app.database.queries import get_user_by_id
        user = get_user_by_id(user_id)
        if not user:
            return {"error": "User not found"}, 404

        update_user_ban_status(user_id, args['is_banned'])
        status = "banned" if args['is_banned'] else "unbanned"
        logger.info(
            "admin.user.ban.patch",
            admin_user_id=g.user.get('id'),
            admin_email=g.user.get('email'),
            target_user_id=user_id,
            new_ban_status=args['is_banned']
        )
        return {"message": f"User has been {status}."}


class AdminMovieListResource(Resource):
    @admin_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("page", type=int, default=1, location="args")
        parser.add_argument("per_page", type=int, default=10, location="args")
        args = parser.parse_args()
        return queries.get_all_movies(page=args['page'], per_page=args['per_page'], paginated=True)


class AdminReviewListResource(Resource):
    @admin_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("page", type=int, default=1, location="args")
        parser.add_argument("per_page", type=int, default=10, location="args")
        args = parser.parse_args()
        return queries.get_all_reviews(page=args['page'], per_page=args['per_page'], paginated=True)


class AdminFixtureListResource(Resource):
    @admin_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("page", type=int, default=1, location="args")
        parser.add_argument("per_page", type=int, default=10, location="args")
        args = parser.parse_args()
        return queries.get_all_fixtures(page=args['page'], per_page=args['per_page'], paginated=True)


class AdminLogResource(Resource):
    @admin_required
    def get(self):
        log_file_path = os.environ.get("LOG_FILE_PATH", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "app.log"))
        logs = []
        try:
            with open(log_file_path, 'r', encoding='utf-8') as f:
                # Read lines and reverse them to get the most recent logs first
                all_lines = f.readlines()
                recent_lines = all_lines[-200:] # Get last 200 lines
                for line in reversed(recent_lines):
                    try:
                        logs.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue # Ignore malformed lines
            return {"logs": logs}
        except FileNotFoundError:
            return {"error": "Log file not found."}, 404
        except Exception as e:
            logger.error("admin.logs.get.failed", error=str(e))
            return {"error": "Failed to read log file."}, 500


class AdminUserListResource(Resource):
    @admin_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("page", type=int, default=1, location="args")
        parser.add_argument("per_page", type=int, default=10, location="args")
        args = parser.parse_args()
        return queries.get_all_users(page=args['page'], per_page=args['per_page'], paginated=True)


class AdminUserSearchResource(Resource):
    @admin_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("q", type=str, default="", location="args")
        parser.add_argument("page", type=int, default=1, location="args")
        parser.add_argument("per_page", type=int, default=10, location="args")
        args = parser.parse_args()
        logger.info(
            "admin.user.search.get",
            admin_user_id=g.user.get('id'),
            admin_email=g.user.get('email'),
            query=args['q']
        )
        return search_users_admin(query=args['q'], page=args['page'], per_page=args['per_page'])


class AdminRecentActivityResource(Resource):
    @admin_required
    def get(self):
        logger.info(
            "admin.recent.get",
            admin_user_id=g.user.get('id'),
            admin_email=g.user.get('email')
        )
        return get_recent_activity()


class AdminPasswordResetCleanupResource(Resource):
    @admin_required
    def delete(self):
        count = delete_expired_password_resets()
        logger.info(
            "admin.password_resets.cleanup",
            admin_user_id=g.user.get('id'),
            admin_email=g.user.get('email'),
            deleted_count=count
        )
        return {"message": f"Deleted {count} expired password reset(s).", "deleted_count": count}


api.add_resource(AdminStatsResource, "/stats")
api.add_resource(AdminUserListResource, "/users")
api.add_resource(AdminUserRoleResource, "/users/<int:user_id>/role")
api.add_resource(AdminUserResource, "/users/<int:user_id>")
api.add_resource(AdminUserBanResource, "/users/<int:user_id>/ban")
api.add_resource(AdminReviewResource, "/reviews/<int:review_id>")
api.add_resource(AdminMovieResource, "/movies/<int:movie_id>")

api.add_resource(AdminMovieListResource, "/movies")
api.add_resource(AdminReviewListResource, "/reviews")
api.add_resource(AdminFixtureListResource, "/fixtures")
api.add_resource(AdminLogResource, "/logs")
api.add_resource(AdminRecentActivityResource, "/activity/recent")
api.add_resource(AdminUserSearchResource, "/users/search")
api.add_resource(AdminPasswordResetCleanupResource, "/password-resets/cleanup")