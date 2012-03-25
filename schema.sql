drop table if exists user;
create table user (
  user_id integer primary key autoincrement,
  username string not null,
  pw_hash string not null
);


drop table if exists tag;
create table tag (
  tag_id integer primary key autoincrement,
  tag string not null,
  user_id integer not null
);
