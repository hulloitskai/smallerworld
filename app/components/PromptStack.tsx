import { type CardProps, Text } from "@mantine/core";
import { motion, useMotionValue, useTransform } from "motion/react";

import { type Prompt, type PromptDeck } from "~/types";

import classes from "./PromptStack.module.css";

export interface PromptStackProps
  extends Pick<
      StackCardProps,
      "deck" | "height" | "width" | "flipBoundary" | "radius"
    >,
    Omit<BoxProps, "h" | "w" | "mah" | "maw" | "children"> {
  prompts: Prompt[];
  onIndexChange?: (index: number) => void;
}

const CARD_ROTATIONS = [-1, 2, -2, 1];

const PromptStack: FC<PromptStackProps> = ({
  prompts,
  deck,
  width,
  height,
  flipBoundary,
  radius,
  onIndexChange,
  className,
  ...otherProps
}) => {
  const [index, setIndex] = useState(0);
  const orderedPrompts = useMemo(
    () => [...prompts.slice(index), ...prompts.slice(0, index)],
    [prompts, index],
  );
  useDidUpdate(() => {
    onIndexChange?.(index);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      className={cn("PromptStack", classes.container, className)}
      h={height + (prompts.length - 1) * 8}
      {...otherProps}
    >
      {orderedPrompts.map((prompt, i) => {
        const originalIndex = (i + index) % prompts.length;
        return (
          <StackCard
            key={prompt.id}
            {...{ prompt, deck, width, height, flipBoundary, radius }}
            totalCards={orderedPrompts.length}
            index={i}
            rotation={
              prompts.length > 1 ? (CARD_ROTATIONS[originalIndex] ?? 0) : 0
            }
            onDragToFlipBoundary={() => {
              setIndex(prevIndex => (prevIndex + 1) % prompts.length);
            }}
          />
        );
      })}
    </Box>
  );
};

export default PromptStack;

interface StackCardProps extends CardProps {
  prompt: Prompt;
  deck: PromptDeck;
  index: number;
  totalCards: number;
  width: number;
  height: number;
  rotation: number;
  flipBoundary: number;
  onDragToFlipBoundary: () => void;
}

const StackCard: FC<StackCardProps> = ({
  prompt,
  deck,
  index,
  totalCards,
  width,
  height,
  rotation,
  flipBoundary,
  onDragToFlipBoundary,
  ...otherProps
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);
  const canDrag = totalCards > 1 && index === 0;
  const draggingRef = useRef(false);

  return (
    <Card
      component={motion.div}
      initial={false}
      animate={{ top: (totalCards - 1 - index) * 8, scale: 1 - index * 0.06 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      drag={canDrag}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.75}
      className={classes.card}
      w={width}
      h={height}
      bg={deck.background_color}
      c={deck.text_color}
      mod={{ blur: !canDrag && totalCards > 1 }}
      style={{
        x,
        y,
        rotateX,
        rotateY,
        rotateZ: rotation,
        zIndex: totalCards - index,
        ...(canDrag && { cursor: "grab" }),
      }}
      onDragStart={() => {
        draggingRef.current = true;
      }}
      onDragEnd={(event, { offset }) => {
        draggingRef.current = false;
        if (
          Math.abs(offset.x) > flipBoundary ||
          Math.abs(offset.y) > flipBoundary
        ) {
          onDragToFlipBoundary();
        } else {
          event.stopImmediatePropagation();
          x.set(0);
          y.set(0);
        }
      }}
      {...otherProps}
    >
      <Text size="xl" fw="bold" ta="center" lh={1.2}>
        {prompt.prompt}
      </Text>
    </Card>
  );
};
