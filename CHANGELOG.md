# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-12

### Added
- Initial release of Permissions System
- User authentication with JWT tokens
- Role-based access control (RBAC)
- Permissions management system
- Workspace isolation
- QQ Bot binding integration
- Web-based admin panel (React + TypeScript)
- RESTful API (Express + TypeScript)
- MySQL database backend
- Docker containerization
- Nginx reverse proxy configuration

### Fixed
- **Critical**: Login API URL configuration - Vite environment variables not properly passed through Docker build
  - Modified Dockerfile to accept ARG VITE_API_BASE_URL and set as ENV
  - Updated docker-compose.yml to pass build args and environment variables
  - Full rebuild required with --no-cache flag
- **Critical**: Frontend component imports missing
  - Added Divider import to Roles.tsx
  - Added Input import to Permissions.tsx
- Build caching issues resolved by using --no-cache

### Technical Details
- Frontend: React 18, TypeScript, Vite, Ant Design
- Backend: Express 4, TypeScript, MySQL 8.0, JWT
- Infrastructure: Docker Compose, Nginx, MySQL 8.0
- Authentication: JWT with 24h expiration
- Default admin: admin@openclaw.ai / SuperAdmin123!

### Deployment
- Production URL: http://43.156.131.98:8998/admin/
- Frontend container: openclaw-permissions-frontend
- Backend container: openclaw-permissions-backend
- Database container: openclaw-permissions-mysql
- Nginx config: /www/server/panel/vhost/nginx/proxy/43.156.131.98/

### Known Issues
- None at this time

### Migration Notes
- Run init-superadmin.sh to create default admin user
- Ensure MySQL data volume persists across container restarts
- Update .env files with production credentials before deployment
