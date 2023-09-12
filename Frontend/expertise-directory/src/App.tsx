import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  theme,
} from "@chakra-ui/react"

export const App = () => (
  <ChakraProvider theme={theme}>
    <Box textAlign="center" fontSize="6xl">
      <Text>
        {'LOG8970'}
      </Text>
    </Box>
  </ChakraProvider>
)
