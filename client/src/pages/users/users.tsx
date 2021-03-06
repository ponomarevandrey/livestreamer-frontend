import * as React from "react";

import { PageHeading } from "../../lib/page-heading/page-heading";
import { UserMeta } from "./user-meta/user-meta";
import { useFetch } from "../../hooks/use-fetch";
import { API_ROOT_URL } from "../../config/env";
import { UsersResponse } from "../../types";
import { Loader } from "../../lib/loader/loader";
import { useIsMounted } from "../../hooks/use-is-mounted";
import { Message } from "../../lib/message/message";
import { Page } from "../../lib/page/page";

function PagesUsers(
  props: React.HTMLAttributes<HTMLDivElement>
): React.ReactElement {
  const isMounted = useIsMounted();
  const { state: users, fetchNow: sendhUsersRequest } =
    useFetch<UsersResponse>();

  React.useEffect(() => {
    if (isMounted) {
      sendhUsersRequest(`${API_ROOT_URL}/users`, {
        method: "get",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
      });
    }
  }, [isMounted]);

  return (
    <Page className="page_list">
      <PageHeading iconName="users" name="Users" />

      {users.isLoading && <Loader for="page" color="pink" />}

      {users.error && <Message type="danger">Something went wrong :(</Message>}

      {users.response?.body &&
        users.response.body.results.map((user) => {
          return (
            <UserMeta
              email={user.email}
              username={user.username}
              id={user.id}
              permissions={user.permissions}
              key={user.id}
            />
          );
        })}
    </Page>
  );
}

export { PagesUsers };
