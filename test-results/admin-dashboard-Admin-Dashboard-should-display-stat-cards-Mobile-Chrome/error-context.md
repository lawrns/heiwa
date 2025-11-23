# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "404" [level=1] [ref=e4]
    - heading "This page could not be found." [level=2] [ref=e6]
  - generic [ref=e8]:
    - link "Inicio" [ref=e10] [cursor=pointer]:
      - /url: /
      - img [ref=e11]
      - generic [ref=e13]: Inicio
    - link "Colección" [ref=e15] [cursor=pointer]:
      - /url: /coleccion
      - img [ref=e16]
      - generic [ref=e20]: Colección
    - button "10% 1ª compra" [ref=e22] [cursor=pointer]:
      - generic [ref=e23]:
        - img [ref=e24]
        - generic [ref=e26]: 10%
      - generic [ref=e27]: 1ª compra
    - button "Carrito" [ref=e29] [cursor=pointer]:
      - img [ref=e31]
      - generic [ref=e33]: Carrito
    - link "Cuenta" [ref=e35] [cursor=pointer]:
      - /url: /account
      - img [ref=e36]
      - generic [ref=e38]: Cuenta
  - button "Open Next.js Dev Tools" [ref=e44] [cursor=pointer]:
    - img [ref=e45]
  - alert [ref=e48]
```