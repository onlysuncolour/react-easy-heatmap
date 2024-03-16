import classNames from 'classnames';
import React, { FC, useEffect, useRef } from 'react';

import './index.css';

type DraggablePropsType = {
  wrapperDom: HTMLDivElement;
  moveDom: HTMLDivElement;
  className?: string;
  onMovingStart: () => void;
  onMovingEnd: () => void;
  triggerUpdateState?: any;
};
const Draggable: FC<DraggablePropsType> = ({
  wrapperDom,
  moveDom,
  className,
  onMovingStart,
  onMovingEnd,
  triggerUpdateState,
}) => {
  const positionRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const hotDragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { width, height } = wrapperDom?.getBoundingClientRect() ?? {};
    const { width: moveW, height: moveH } = moveDom?.getBoundingClientRect() ?? {};
    const onMousemoveListener = (e: MouseEvent) => {
      e.stopPropagation();

      if (draggingRef.current) {
        const { x, y } = positionRef.current;
        const { clientX, clientY } = e;
        const offsetX = clientX - x;
        const offsetY = clientY - y;
        const { offsetLeft, offsetTop } = moveDom;

        let newX = offsetLeft + offsetX;
        let newY = offsetTop + offsetY;

        if (newX < 0) {
          newX = 0;
        }

        if (newX + moveW > width) {
          newX = width - moveW;
        }

        if (newY < 0) {
          newY = 0;
        }

        if (newY + moveH > height) {
          newY = height - moveH;
        }

        positionRef.current = {
          x: clientX,
          y: clientY,
        };

        moveDom.style.cssText = `top: ${newY}px; left: ${newX}px`;
      }
    };

    const onMousedownListener = (event:any) => {
      event.stopPropagation();

      draggingRef.current = true;
      positionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      // 鼠标按下，监听鼠标位置，设置moveRef 移动
      onMovingStart();
      window.addEventListener('mousemove', onMousemoveListener);
    };

    const onMouseupListener = (event:any) => {
      event.stopPropagation();

      draggingRef.current = false;
      onMovingEnd();
      window.removeEventListener('mousemove', onMousemoveListener);
    };

    hotDragRef.current?.addEventListener('mousedown', onMousedownListener);
    window.addEventListener('mouseup', onMouseupListener);

    return () => {
      hotDragRef.current?.removeEventListener('mousedown', onMousedownListener);
      window.removeEventListener('mouseup', onMouseupListener);
      window.removeEventListener('mousemove', onMousemoveListener);
    };
  }, [wrapperDom, moveDom, triggerUpdateState]);

  return <div className={classNames(className, 'drag-item--wrapper')} ref={hotDragRef} />;
};

export default Draggable;
