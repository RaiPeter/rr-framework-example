import { db } from "~/db";
import { users } from "~/db/schema";
import type { Route } from "./+types/Users";

interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

export const loader = async () => {
  const allUsers: User[] = await db.select().from(users);
  return allUsers;
};

const Users = ({ loaderData }: Route.ComponentProps) => {
  const users = loaderData;

  if (!users || users.length === 0) {
    return <div>No users found</div>;
  }

  return (
    <div className="users">
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
