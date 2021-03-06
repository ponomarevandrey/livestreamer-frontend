import * as React from "react";

import { useIsMounted } from "../../../hooks/use-is-mounted";
import { LIKE_TIMEOUT_MS } from "../../../config/env";
import { useStreamLikeButton } from "../../../hooks/use-stream-like-button";

import icons from "./../../../icons.svg";
import "./heart-btn.scss";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  isStreamOnline: boolean;
}

function HeartBtn(props: Props): React.ReactElement {
  const isMounted = useIsMounted();

  const { handleBtnClick, setIsBtnEnabled, isBtnEnabled } =
    useStreamLikeButton();
  React.useEffect(() => {
    if (isMounted) setIsBtnEnabled(props.isStreamOnline);
  }, [props.isStreamOnline, isMounted]);

  React.useEffect(() => {
    let timerId: NodeJS.Timer;
    if (isMounted && !isBtnEnabled && props.isStreamOnline) {
      timerId = setTimeout(() => setIsBtnEnabled(true), LIKE_TIMEOUT_MS);
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [isBtnEnabled, isMounted]);

  return (
    <button
      disabled={!isBtnEnabled}
      className={`heart-btn ${
        isBtnEnabled && props.isStreamOnline ? "" : "heart-btn_disabled"
      } ${props.className || ""}`}
      onClick={
        isBtnEnabled && props.isStreamOnline ? handleBtnClick : undefined
      }
      type="submit"
      name="heart"
      value=""
    >
      <svg className="heart-btn__icon">
        <use href={`${icons}#heart`} />
        <animate
          begin="click"
          attributeName="fill"
          values="#333333;#aa0500"
          dur="10s"
          repeatCount="1"
          fill="remove"
        />
      </svg>
    </button>
  );
}

export { HeartBtn };
