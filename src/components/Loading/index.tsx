import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../assets/animations/LoadingAnimation.json';

// Derive the LottieProps type from the Lottie component
type LottieProps = React.ComponentProps<typeof Lottie>;

// LoadingProps accepts loop, autoplay from LottieProps, plus style and className
export interface LoadingProps extends Pick<LottieProps, 'loop' | 'autoplay'> {
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Loading component renders a Lottie animation.
 * Props:
 *  - loop (default: true)
 *  - autoplay (default: true)
 *  - style: CSSProperties for container
 *  - className: custom classname for container
 */
const Loading: React.FC<LoadingProps> = ({
  loop = true,
  autoplay = true,
  style,
  className = ''
}) => (
  <div className={className} style={style}>
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      style={{ width: style?.width || 150, height: style?.height || 150 }}
    />
  </div>
);

export default Loading;