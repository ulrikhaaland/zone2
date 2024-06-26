interface LoadingProps {
  size?: number;
}

export default function Loading({ size = 32 }: LoadingProps) {
  const spinner = (
    <div
      className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-whitebg`}
    ></div>
  );

  if (size !== 32) {
    return spinner;
  } else {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className={`animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-whitebg`}
        ></div>
      </div>
    );
  }
}
