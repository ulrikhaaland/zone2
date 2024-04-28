import "../../../app/globals.css";

export const shimmerItems: JSX.Element[] = [
  <div
    key={1}
    className="shimmer h-2.5 bg-gray-200 rounded-full dark:bg-gray-500 w-[50%] mb-4"
  ></div>,
  <div
    key={2}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[90%] mb-2.5"
  ></div>,
  <div
    key={3}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[85%] mb-2.5"
  ></div>,
  <div
    key={4}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[70%] mb-2.5"
  ></div>,
  <div
    key={5}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[40%] mb-2.5"
  ></div>,
  <div
    key={6}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[70%] mb-8"
  ></div>,
  <div
    key={7}
    className="shimmer h-2.5 bg-gray-200 rounded-full dark:bg-gray-500 w-[30%] mb-4"
  ></div>,
  <div
    key={8}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[70%] mb-2.5"
  ></div>,
  <div
    key={9}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[45%] mb-2.5"
  ></div>,
  <div
    key={10}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[55%] mb-2.5"
  ></div>,
  <div
    key={11}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[50%] mb-2.5"
  ></div>,
  <div
    key={12}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[55%] mb-8"
  ></div>,
  <div
    key={13}
    className="shimmer h-2.5 bg-gray-200 rounded-full dark:bg-gray-500 w-[25%] mb-4"
  ></div>,
  <div
    key={14}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[80%] mb-2.5"
  ></div>,
  <div
    key={15}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[70%] mb-2.5"
  ></div>,
  <div
    key={16}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[69%] mb-2.5"
  ></div>,
  <div
    key={17}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[50%] mb-2.5"
  ></div>,
  <div
    key={18}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[69%] mb-8"
  ></div>,
  <div
    key={19}
    className="shimmer h-2.5 bg-gray-200 rounded-full dark:bg-gray-500 w-[45%] mb-4"
  ></div>,
  <div
    key={20}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[70%] mb-2.5"
  ></div>,
  <div
    key={21}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[85%] mb-2.5"
  ></div>,
  <div
    key={22}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[75%] mb-2.5"
  ></div>,
  <div
    key={23}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[55%] mb-2.5"
  ></div>,
  <div
    key={24}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[55%] mb-2.5"
  ></div>,
  <div
    key={25}
    className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 w-[55%] mb-2.5"
  ></div>,
];

export const GuideSkeletonDesktop = () => (
  <div role="status" className="max-w mb-2 mt-2">
    {shimmerItems}
    <span className="sr-only">Loading...</span>
  </div>
);

export const GuideSkeletonMobile = () => (
  <div role="status" className="max-w pb-4">
    <div className="shimmer h-2.5 bg-gray-200 rounded-full dark:bg-gray-500 w-64 mb-4"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[350px] mb-2.5"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 mb-2.5"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[350px] mb-2.5"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[200px] mb-2.5"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[350px]"></div>
    <div className="shimmer h-2.5 bg-gray-200 rounded-full dark:bg-gray-500 w-64 mb-4 mt-12"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[210px] mb-2.5"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[210px] mb-2.5"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[350px] mb-2.5"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[300px] mb-2.5"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[350px]"></div>
    <div className="shimmer h-2.5 bg-gray-200 rounded-full dark:bg-gray-500 w-64 mb-4 mt-12"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[280px] mb-2.5"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[280px] mb-2.5"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[190px] mb-2.5"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[310px] mb-2.5"></div>
    <div className="shimmer h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[190px]"></div>
    <span className="sr-only">Loading...</span>
  </div>
);
