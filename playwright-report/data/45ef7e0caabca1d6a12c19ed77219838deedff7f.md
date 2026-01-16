# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - navigation "Main navigation" [ref=e3]:
    - generic [ref=e5]:
      - link "Heiwa House" [ref=e7] [cursor=pointer]:
        - /url: /
        - img "Heiwa House" [ref=e8]
      - button "Toggle mobile menu" [ref=e10]:
        - img [ref=e11]
  - main [ref=e15]
  - contentinfo [ref=e101]:
    - generic [ref=e103]:
      - generic [ref=e104]:
        - heading "Find us here" [level=3] [ref=e105]
        - iframe [ref=e107]:
          
      - generic [ref=e108]:
        - heading "General" [level=3] [ref=e109]
        - list [ref=e110]:
          - listitem [ref=e111]:
            - link "Blog" [ref=e112] [cursor=pointer]:
              - /url: /blog
      - generic [ref=e113]:
        - heading "Connect" [level=3] [ref=e114]
        - link "Instagram" [ref=e115] [cursor=pointer]:
          - /url: https://www.instagram.com/heiwahouse_portugal
          - img [ref=e116]
          - generic [ref=e120]: Instagram
      - generic [ref=e121]:
        - heading "About Us" [level=3] [ref=e122]
        - generic [ref=e123]:
          - paragraph [ref=e124]
          - paragraph [ref=e126]
  - button "Contact us on WhatsApp" [ref=e128]:
    - img [ref=e129]
```