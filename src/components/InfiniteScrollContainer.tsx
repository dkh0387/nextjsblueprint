import React from "react";
import {useInView} from "react-intersection-observer";

/**
 * Container, which provides a trigger to automatically load the next page.
 * Works with every data.
 */
interface InfiniteScrollContainerProps extends React.PropsWithChildren {
  onBottomReached: () => void;
  className?: string;
}

export default function InfiniteScrollContainer({
  children,
  onBottomReached,
  className,
}: InfiniteScrollContainerProps) {
  const { ref } = useInView({
    rootMargin: "200px",
    onChange(inView) {
      if (inView) {
        onBottomReached();
      }
    },
  });
  return (
    <div className={className}>
      {/*those are our posts*/}
      {children}
      {/*if we come to 200 px before the end of the current page, the ref triggers loading next posts*/}
      <div ref={ref}></div>
    </div>
  );
}
