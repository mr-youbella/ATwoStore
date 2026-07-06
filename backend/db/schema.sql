CREATE TABLE IF NOT EXISTS users
(
	id              SERIAL PRIMARY KEY,
	username        VARCHAR(50) UNIQUE,
	email           VARCHAR(100) UNIQUE NOT NULL,
	password_hash   TEXT,
	provider        VARCHAR(20) NOT NULL DEFAULT 'credentials',
	email_verified  BOOLEAN DEFAULT FALSE,
	is_admin  		BOOLEAN DEFAULT FALSE,
	digylog_token   TEXT,
	webhook_code    VARCHAR(64) UNIQUE NOT NULL,
	created_at      TIMESTAMP DEFAULT NOW()
);
 
CREATE TABLE IF NOT EXISTS digylog_trackings
(
	id         SERIAL PRIMARY KEY,
	user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	tracking   VARCHAR(50) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	UNIQUE (user_id, tracking)
);

CREATE TABLE IF NOT EXISTS digylog_pickups
(
	id           SERIAL PRIMARY KEY,
	user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	pickup_id    INTEGER UNIQUE NOT NULL,
	area         VARCHAR(100) NOT NULL,
	seller_phone VARCHAR(20)  NOT NULL,
	picker       VARCHAR(100) NOT NULL,
	picker_phone VARCHAR(20) NOT NULL,
	created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders
(
	id         SERIAL PRIMARY KEY,
	user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	name       VARCHAR(100) NOT NULL,
	phone      VARCHAR(20)  NOT NULL,
	address    TEXT         NOT NULL,
	city       VARCHAR(100) NOT NULL,
	price      DECIMAL(10,2) NOT NULL DEFAULT 0,
	createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders_refs
(
	id           SERIAL PRIMARY KEY,
	order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
	designation  TEXT    NOT NULL,
	quantity     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE email_verifications
(
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	code_hash TEXT NOT NULL,
	expires_at TIMESTAMP NOT NULL,
	created_at TIMESTAMP DEFAULT NOW()
);
