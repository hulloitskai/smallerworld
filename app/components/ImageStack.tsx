import { Image } from "@mantine/core";
import { motion, useMotionValue, useTransform } from "motion/react";
import { type PropsWithChildren } from "react";

import { type Image as ImageType } from "~/types";

export interface ImageStackProps extends Omit<BoxProps, "h"> {
  images: ImageType[];
  height: number;
}

const ImageStack: FC<ImageStackProps> = ({
  images,
  height,
  className,
  style,
  ...otherProps
}) => {
  const [cards, setCards] = useState(images);
  const sendToBack = useCallback((id: string) => {
    setCards(prev => {
      const newCards = [...prev];
      const index = newCards.findIndex(card => card.id === id);
      const [card] = newCards.splice(index, 1);
      if (card) {
        newCards.unshift(card);
      }
      return newCards;
    });
  }, []);

  return (
    <Box
      className={cn("ImageStack", className)}
      style={[{ perspective: 600 }, style]}
      {...otherProps}
    >
      {cards.map((card, index) => {
        const randomRotate = Math.random() * 20 - 10;
        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={200}
          >
            <Image
              component={motion.img}
              animate={{
                rotateZ: (cards.length - index - 1) * 4 + randomRotate,
                scale: 1 + index * 0.06 - cards.length * 0.06,
                transformOrigin: "90% 90%",
              }}
              initial={false}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              src={card.src}
              srcSet={card.srcset ?? undefined}
              style={{
                height,
                ...(card.dimensions && {
                  width:
                    (height * card.dimensions.width) / card.dimensions.height,
                }),
              }}
            />
          </CardRotate>
        );
      })}
    </Box>
  );
};

export default ImageStack;

interface CardRotateProps extends PropsWithChildren {
  sensitivity: number;
  onSendToBack: () => void;
}

const CardRotate: FC<CardRotateProps> = ({
  sensitivity,
  onSendToBack,
  children,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_: never, info: { offset: { x: number; y: number } }) {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
};
