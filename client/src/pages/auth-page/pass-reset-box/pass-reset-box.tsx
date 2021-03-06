import * as React from "react";

import { Box } from "../../../lib/box/box";
import { PassResetForm } from "../pass-reset-form/pass-reset-form";
import { useNavigate } from "react-router";
import { useAuthN } from "../../../hooks/use-authn";
import { ROUTES } from "../../../config/routes";

function PassResetBox() {
  const navigate = useNavigate();
  const auth = useAuthN();
  React.useEffect(() => {
    if (auth.user) navigate(ROUTES.root);
  });

  return (
    <Box>
      <h1 className="box__header">Password Reset</h1>
      <PassResetForm />
    </Box>
  );
}

export { PassResetBox };
