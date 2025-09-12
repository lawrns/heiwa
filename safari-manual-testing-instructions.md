# Safari Manual Testing Instructions
## Heiwa Booking Widget CSS Modularization Verification

**🎯 OBJECTIVE:** Verify that the CSS modularization maintains 100% visual and functional parity in Safari browser.

---

## 🔧 **STEP 1: DEVELOPER TOOLS SETUP**

1. **Open Safari Developer Tools:**
   - Press `⌘ + ⌥ + I` (Cmd + Option + I)
   - Or: Safari Menu → Develop → Show Web Inspector

2. **Navigate to Network Tab:**
   - Click "Network" tab in Developer Tools
   - Ensure "All" filter is selected
   - Clear any existing entries (🗑️ icon)

3. **Refresh the page** (`⌘ + R`) to capture all network requests

---

## 📊 **STEP 2: CSS LOADING VERIFICATION**

### **2.1 Check CSS Files Loading:**
In the Network tab, look for these CSS files and verify:

✅ **Expected CSS Files (in order):**
1. `base.css?v=20250912-02` - Should load first
2. `components.css?v=20250912-02` - Should load after base
3. `layout.css?v=20250912-02` - Should load after components  
4. `utilities.css?v=20250912-02` - Should load last

### **2.2 Verify Loading Status:**
- [ ] All 4 CSS files show **200 OK** status
- [ ] No **404 Not Found** errors
- [ ] File sizes are reasonable (each should be <20KB)
- [ ] Loading times are fast (<100ms each)

### **2.3 Check Console for Errors:**
- Switch to **Console** tab
- Look for any red error messages
- Verify widget initialization logs appear:
  - "Heiwa Booking Widget: Initializing..."
  - "Heiwa Booking Widget: Loaded X surf camps"

---

## 🎨 **STEP 3: VISUAL DESIGN VERIFICATION**

### **3.1 Premium Surf Theme Check:**
- [ ] **Heiwa Orange Color:** Primary buttons and accents use #ec681c
- [ ] **Wave Patterns:** Subtle wave graphics visible in design elements
- [ ] **Ocean Gradients:** Blue-to-teal gradients in backgrounds
- [ ] **Professional Polish:** Clean, modern, high-quality appearance
- [ ] **Typography:** Archivo font family rendering correctly

### **3.2 Layout and Spacing:**
- [ ] **Widget Trigger Button:** Positioned on right side, properly styled
- [ ] **Modal Centering:** Booking modal centers on screen
- [ ] **Element Spacing:** Consistent margins and padding throughout
- [ ] **Visual Hierarchy:** Clear heading levels and content organization

---

## 📱 **STEP 4: RESPONSIVE DESIGN TESTING**

### **4.1 Desktop View (1280px+):**
1. **Resize browser window** to desktop size
2. **Verify:**
   - [ ] Widget trigger button visible on right
   - [ ] Modal opens centered and appropriately sized
   - [ ] All text readable without zooming
   - [ ] Buttons and form elements properly sized

### **4.2 Tablet View (768px-1023px):**
1. **Resize browser window** to tablet width
2. **Verify:**
   - [ ] Layout adapts smoothly
   - [ ] Touch targets adequate size (44px minimum)
   - [ ] Modal remains usable
   - [ ] No horizontal scrolling required

### **4.3 Mobile View (≤767px):**
1. **Resize browser window** to mobile width
2. **Verify:**
   - [ ] Widget becomes full-screen or near full-screen
   - [ ] All buttons touch-friendly (44px+ height)
   - [ ] Text remains readable
   - [ ] Navigation elements stack vertically

---

## 🔄 **STEP 5: BOOKING FLOW TESTING**

### **5.1 Widget Initialization:**
1. **Click "BOOK NOW" button**
2. **Verify:**
   - [ ] Modal opens smoothly with animation
   - [ ] Booking type selection screen appears
   - [ ] Two options visible: "Book a Room" and "All-Inclusive Surf Week"

### **5.2 Surf Week Booking Flow:**
1. **Select "All-Inclusive Surf Week"**
2. **Verify:**
   - [ ] Smooth transition to surf weeks list
   - [ ] 13 surf camps load and display
   - [ ] Each camp shows: title, dates, price, availability
   - [ ] Skill level badges visible (BEGINNER/INTERMEDIATE/ADVANCED)
   - [ ] Pricing in correct format (€XXX.XX)

3. **Select a surf camp**
4. **Verify:**
   - [ ] Selection highlights properly
   - [ ] "Continue" button becomes enabled
   - [ ] Summary sidebar updates with selection

### **5.3 Room Booking Flow:**
1. **Go back and select "Book a Room"**
2. **Verify:**
   - [ ] Transition to calendar interface
   - [ ] Check-in date picker functional
   - [ ] Check-out date picker functional
   - [ ] Participant counter (+/-) buttons work
   - [ ] "Check Room Availability" button present

---

## ⚡ **STEP 6: BACKEND INTEGRATION TESTING**

### **6.1 API Connectivity Check:**
1. **In Network tab, look for API calls:**
   - [ ] `/wp-json/heiwa/v1/surf-camps` - Should return 200 OK
   - [ ] Response should contain 13 surf camps
   - [ ] Response time should be <2 seconds

2. **Check Console for API logs:**
   - [ ] "Heiwa Booking Widget: API response received"
   - [ ] "Heiwa Booking Widget: Loaded 13 surf camps"

### **6.2 Data Validation:**
1. **Verify surf camp data includes:**
   - [ ] Title, dates, price, availability count
   - [ ] Skill level categorization
   - [ ] Proper date formatting
   - [ ] Consistent pricing format

---

## 🔧 **STEP 7: TECHNICAL VALIDATION**

### **7.1 Console Error Check:**
- [ ] **No JavaScript errors** (red messages in console)
- [ ] **No CSS loading failures**
- [ ] **No 404 errors** for any assets
- [ ] **Widget initialization completes** successfully

### **7.2 Performance Assessment:**
- [ ] **Page loads quickly** (<3 seconds total)
- [ ] **CSS files load fast** (<200ms each)
- [ ] **Animations are smooth** (no stuttering)
- [ ] **No render-blocking issues**

---

## ♿ **STEP 8: ACCESSIBILITY TESTING**

### **8.1 Keyboard Navigation:**
1. **Use Tab key to navigate through widget**
2. **Verify:**
   - [ ] All interactive elements reachable
   - [ ] Tab order is logical
   - [ ] Focus indicators visible
   - [ ] Enter/Space keys activate buttons
   - [ ] Escape key closes modal

### **8.2 Screen Reader Simulation:**
1. **Right-click elements and "Inspect"**
2. **Check for:**
   - [ ] ARIA labels on buttons and form fields
   - [ ] Proper heading hierarchy (h1→h2→h3)
   - [ ] Alt text on images
   - [ ] Form labels properly associated

---

## 📋 **STEP 9: ISSUE DOCUMENTATION**

### **If Issues Found:**
For each issue discovered, document:

```
**Issue #:** [Sequential number]
**Severity:** Critical/Major/Minor
**Component:** CSS/JavaScript/API/UI
**Description:** [What's wrong]
**Steps to Reproduce:** [Exact steps]
**Expected:** [What should happen]
**Actual:** [What actually happens]
**Screenshot:** [If visual issue]
**Browser:** Safari [version]
**Impact:** [User experience impact]
```

---

## ✅ **STEP 10: FINAL ASSESSMENT**

### **Success Criteria:**
- [ ] All 4 CSS files load without errors
- [ ] Visual design 100% preserved
- [ ] Both booking flows work completely
- [ ] No console errors
- [ ] Responsive design functions across all viewports
- [ ] Accessibility standards met
- [ ] Performance within acceptable limits

### **Final Status:**
- **✅ PASS:** All criteria met - CSS modularization successful
- **❌ FAIL:** Critical issues found - requires remediation

---

**📝 Note:** Document all findings in the gap analysis template for comprehensive reporting and remediation planning.
