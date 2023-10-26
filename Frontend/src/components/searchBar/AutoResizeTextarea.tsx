/* eslint-disable react/display-name */
import { Textarea, TextareaProps } from '@chakra-ui/react';
import React from 'react';
import ResizeTextarea from 'react-textarea-autosize';

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>((props, ref) => {
    return (
        <Textarea
            minH="unset"
            w="100%"
            resize="none"
            ref={ref}
            minRows={1}
            maxRows={3}
            as={ResizeTextarea}
            {...props}
        />
        
    );
});