alter table projects
  alter column user_id drop not null,
  alter column user_id set default null;

alter table projects
  drop constraint if exists projects_user_id_fkey,
  add constraint projects_user_id_fkey
    foreign key (user_id) references profiles(id) on delete set null;
