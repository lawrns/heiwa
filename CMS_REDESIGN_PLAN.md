# CMS Redesign Plan - WordPress-Style Editor

**Document Version**: 1.0  
**Created**: November 8, 2025  
**Status**: PLANNING  
**Priority**: HIGH  

---

## Executive Summary

The current CMS implementation has a confusing UX where users don't understand how to edit page content. This plan redesigns the CMS into a WordPress-style page editor that is intuitive, visual, and efficient.

**Key Improvements**:
- ✅ Clear page-based navigation (CMS → Pages → Flow)
- ✅ Full-page editor showing all sections at once
- ✅ Drag-and-drop reordering with visual feedback
- ✅ Inline editing without modal dialogs
- ✅ Auto-save to prevent data loss
- ✅ Rich text editing for content
- ✅ Section templates for quick creation

---

## Current State Analysis

### Issues with Current CMS

1. **Navigation Confusion**
   - Users don't know where to start
   - "Pages" tab shows sections, not pages
   - No clear page structure

2. **Editing Experience**
   - Must click edit icon to open modal
   - Can't see all sections at once
   - No visual feedback for changes
   - No preview of changes

3. **Content Management**
   - Unclear relationship between pages and sections
   - Difficult to reorder sections
   - No templates for common sections
   - No auto-save (risk of data loss)

4. **Visual Hierarchy**
   - Section cards don't show content preview
   - No indication of section type
   - No active/inactive status visibility

### Current File Structure

```
components/admin/editors/
├── PageContentEditor.tsx (confusing list view)
├── TestimonialsManager.tsx
└── FAQManager.tsx

app/admin/cms/
└── page.tsx (tabbed interface)
```

---

## Proposed Solution

### New CMS Architecture

```
┌─────────────────────────────────────────────────────────┐
│ CMS Dashboard                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Sidebar Navigation:                                    │
│  ├─ Pages                                               │
│  │  ├─ Flow                                             │
│  │  ├─ Play                                             │
│  │  ├─ Surf                                             │
│  │  ├─ The Spot                                         │
│  │  ├─ About                                            │
│  │  └─ Contact                                          │
│  ├─ Testimonials                                        │
│  ├─ FAQ                                                 │
│  ├─ Analytics                                           │
│  └─ Settings                                            │
│                                                         │
│  Main Content Area:                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Flow - Page Editor                 [Save] [Preview] │
│  ├─────────────────────────────────────────────────┤   │
│  │                                                 │   │
│  │ Page Metadata                                   │   │
│  │ ├─ Title: Heiwa Flow                            │   │
│  │ ├─ Slug: flow                                   │   │
│  │ └─ Meta Description: [...]                      │   │
│  │                                                 │   │
│  │ Content Sections                                │   │
│  │ ├─ [Hero Section] ▲▼ [Edit] [Delete]            │   │
│  │ ├─ [Introduction] ▲▼ [Edit] [Delete]            │   │
│  │ ├─ [Text Section] ▲▼ [Edit] [Delete]            │   │
│  │ └─ [+ Add Section]                              │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Foundation & Navigation (Week 1, Days 1-2)

**Objective**: Restructure CMS navigation and create page-based routing

#### 1.1 Create New Route Structure

**Files to Create**:
- `app/admin/cms/pages/page.tsx` - Pages list view
- `app/admin/cms/pages/[slug]/page.tsx` - Individual page editor
- `app/admin/cms/testimonials/page.tsx` - Testimonials page
- `app/admin/cms/faq/page.tsx` - FAQ page
- `app/admin/cms/analytics/page.tsx` - Analytics page

**Tasks**:
- [ ] Create `/admin/cms/pages` route showing list of all pages
- [ ] Create `/admin/cms/pages/[slug]` dynamic route for page editor
- [ ] Create `/admin/cms/testimonials` route
- [ ] Create `/admin/cms/faq` route
- [ ] Create `/admin/cms/analytics` route
- [ ] Update `/admin/cms` to redirect to `/admin/cms/pages`

**Testing**:
- [ ] Navigate to `/admin/cms` - should redirect to `/admin/cms/pages`
- [ ] Navigate to `/admin/cms/pages` - should show list of pages
- [ ] Click on "Flow" - should navigate to `/admin/cms/pages/flow`
- [ ] Verify all routes are accessible
- [ ] Verify breadcrumb navigation works

#### 1.2 Create CMS Navigation Component

**Files to Create**:
- `components/admin/cms/CMSNavigation.tsx` - Sidebar navigation
- `components/admin/cms/CMSBreadcrumb.tsx` - Breadcrumb navigation

**Tasks**:
- [ ] Create sidebar navigation with all CMS sections
- [ ] Highlight current active section
- [ ] Add breadcrumb component showing current location
- [ ] Style navigation to match admin theme
- [ ] Add icons for each section

**Testing**:
- [ ] Navigation shows all sections
- [ ] Active section is highlighted
- [ ] Breadcrumb shows correct path
- [ ] Navigation links work correctly
- [ ] Mobile responsive navigation

#### 1.3 Update CMS Dashboard

**Files to Modify**:
- `app/admin/cms/page.tsx` - Update to show pages list

**Tasks**:
- [ ] Remove tabbed interface
- [ ] Show list of pages with descriptions
- [ ] Add "Edit" button for each page
- [ ] Add quick stats (total sections, last modified)
- [ ] Add search/filter for pages

**Testing**:
- [ ] Pages list displays correctly
- [ ] Edit buttons navigate to correct page editor
- [ ] Stats display correctly
- [ ] Search functionality works

**Timeline**: 2 days  
**Estimated Effort**: 8 hours

---

### Phase 2: Page Editor Component (Week 1, Days 3-4)

**Objective**: Build WordPress-style page editor with section management

#### 2.1 Create PageEditor Component

**Files to Create**:
- `components/admin/editors/PageEditor.tsx` - Main page editor
- `components/admin/editors/SectionCard.tsx` - Individual section display
- `components/admin/editors/PageMetadataEditor.tsx` - Page settings
- `components/admin/editors/SectionTypeSelector.tsx` - Section type picker

**Tasks**:
- [ ] Create PageEditor component with full layout
- [ ] Fetch page data and sections from API
- [ ] Display page metadata (title, slug, description)
- [ ] Display all sections in order
- [ ] Add "Add Section" button at bottom
- [ ] Implement loading and error states
- [ ] Add save button with status indicator

**Testing**:
- [ ] Page loads and displays sections
- [ ] Sections display in correct order
- [ ] Page metadata displays correctly
- [ ] Loading state shows while fetching
- [ ] Error state shows if API fails
- [ ] Save button is disabled while saving

#### 2.2 Create SectionCard Component

**Files to Create**:
- `components/admin/editors/SectionCard.tsx` - Section display card

**Tasks**:
- [ ] Create card component for each section
- [ ] Show section type (Hero, Text, Gallery, etc.)
- [ ] Show section title/preview
- [ ] Show active/inactive status
- [ ] Add drag handle for reordering
- [ ] Add Edit button
- [ ] Add Delete button
- [ ] Add Toggle Active button
- [ ] Implement hover effects

**Testing**:
- [ ] Card displays all information correctly
- [ ] Drag handle is visible and accessible
- [ ] Edit button opens modal
- [ ] Delete button shows confirmation
- [ ] Toggle active button works
- [ ] Hover effects work on desktop/mobile

#### 2.3 Create PageMetadataEditor Component

**Files to Create**:
- `components/admin/editors/PageMetadataEditor.tsx` - Page settings

**Tasks**:
- [ ] Create form for page title, slug, description
- [ ] Add validation for required fields
- [ ] Add character count for description
- [ ] Show SEO preview
- [ ] Add save button
- [ ] Implement auto-save

**Testing**:
- [ ] Form displays correctly
- [ ] Validation works for required fields
- [ ] Character count updates
- [ ] SEO preview updates
- [ ] Save button works
- [ ] Auto-save works

#### 2.4 Create SectionTypeSelector Component

**Files to Create**:
- `components/admin/editors/SectionTypeSelector.tsx` - Type picker

**Tasks**:
- [ ] Create modal/dialog for selecting section type
- [ ] Show all available section types with icons
- [ ] Show description for each type
- [ ] Filter by category (Content, Media, CTA, etc.)
- [ ] Add search functionality

**Testing**:
- [ ] All section types display
- [ ] Icons show correctly
- [ ] Descriptions are clear
- [ ] Filter works
- [ ] Search works
- [ ] Selection works

**Timeline**: 2 days  
**Estimated Effort**: 16 hours

---

### Phase 3: Section Editing (Week 1, Days 5 + Week 2, Days 1-2)

**Objective**: Build context-aware section editors

#### 3.1 Create Enhanced SectionEditModal

**Files to Create**:
- `components/admin/editors/SectionEditModal.tsx` - Enhanced modal
- `components/admin/editors/sections/HeroSectionEditor.tsx`
- `components/admin/editors/sections/TextSectionEditor.tsx`
- `components/admin/editors/sections/GallerySectionEditor.tsx`
- `components/admin/editors/sections/VideoSectionEditor.tsx`
- `components/admin/editors/sections/CustomSectionEditor.tsx`

**Tasks**:
- [ ] Create base SectionEditModal component
- [ ] Implement context-aware rendering based on section type
- [ ] Create HeroSectionEditor with image/video upload
- [ ] Create TextSectionEditor with rich text editor
- [ ] Create GallerySectionEditor with image management
- [ ] Create VideoSectionEditor with video URL input
- [ ] Create CustomSectionEditor for JSON content
- [ ] Add validation for each section type
- [ ] Add preview of changes

**Testing**:
- [ ] Modal opens with correct section type editor
- [ ] All fields display correctly
- [ ] Validation works for required fields
- [ ] File uploads work
- [ ] Rich text editor works
- [ ] Preview updates in real-time
- [ ] Save button saves changes
- [ ] Cancel button closes without saving

#### 3.2 Create Rich Text Editor Component

**Files to Create**:
- `components/admin/ui/RichTextEditor.tsx` - WYSIWYG editor

**Tasks**:
- [ ] Integrate rich text editor library (TipTap or similar)
- [ ] Add formatting buttons (bold, italic, underline, etc.)
- [ ] Add heading levels
- [ ] Add lists (ordered, unordered)
- [ ] Add links
- [ ] Add code blocks
- [ ] Add character count
- [ ] Add undo/redo
- [ ] Style to match admin theme

**Testing**:
- [ ] All formatting buttons work
- [ ] Text formatting applies correctly
- [ ] Links can be added/removed
- [ ] Lists work correctly
- [ ] Character count updates
- [ ] Undo/redo works
- [ ] Content persists

#### 3.3 Create Image Upload Component

**Files to Create**:
- `components/admin/ui/ImageUploader.tsx` - Image upload

**Tasks**:
- [ ] Create drag-and-drop image uploader
- [ ] Integrate with Supabase Storage
- [ ] Show upload progress
- [ ] Show image preview
- [ ] Add image cropping
- [ ] Add alt text field
- [ ] Add image optimization
- [ ] Show file size

**Testing**:
- [ ] Drag-and-drop works
- [ ] File selection works
- [ ] Upload progress shows
- [ ] Image preview displays
- [ ] Cropping works
- [ ] Alt text saves
- [ ] File size is optimized
- [ ] Error handling for large files

**Timeline**: 3 days  
**Estimated Effort**: 24 hours

---

### Phase 4: Drag-and-Drop & Reordering (Week 2, Days 3-4)

**Objective**: Implement section reordering with visual feedback

#### 4.1 Implement Drag-and-Drop

**Files to Create**:
- `components/admin/ui/DragHandle.tsx` - Drag indicator
- `lib/hooks/useDragAndDrop.ts` - Drag-and-drop hook

**Tasks**:
- [ ] Integrate drag-and-drop library (react-beautiful-dnd or similar)
- [ ] Create drag handle component
- [ ] Implement section reordering
- [ ] Add visual feedback during drag
- [ ] Show drop zone indicator
- [ ] Update order in database
- [ ] Add undo for reordering
- [ ] Handle edge cases (single item, etc.)

**Testing**:
- [ ] Drag handle appears on hover
- [ ] Sections can be dragged
- [ ] Drop zones are visible
- [ ] Order updates after drop
- [ ] Database updates correctly
- [ ] Undo works
- [ ] Works on touch devices
- [ ] Keyboard navigation works

#### 4.2 Create Reorder API Endpoint

**Files to Create**:
- `app/api/admin/pages/[slug]/reorder/route.ts` - Reorder endpoint

**Tasks**:
- [ ] Create PATCH endpoint for reordering
- [ ] Accept array of section IDs in new order
- [ ] Update order_index for all sections
- [ ] Return updated sections
- [ ] Add error handling
- [ ] Add validation

**Testing**:
- [ ] Endpoint accepts valid requests
- [ ] Order updates correctly
- [ ] Returns updated sections
- [ ] Validation rejects invalid data
- [ ] Error handling works
- [ ] Concurrent requests handled correctly

**Timeline**: 2 days  
**Estimated Effort**: 12 hours

---

### Phase 5: Auto-Save & State Management (Week 2, Days 5)

**Objective**: Implement auto-save and prevent data loss

#### 5.1 Implement Auto-Save

**Files to Create**:
- `lib/hooks/useAutoSave.ts` - Auto-save hook
- `components/admin/ui/SaveStatus.tsx` - Save status indicator

**Tasks**:
- [ ] Create useAutoSave hook
- [ ] Auto-save every 30 seconds
- [ ] Show save status (saving, saved, error)
- [ ] Debounce rapid changes
- [ ] Handle save errors gracefully
- [ ] Show unsaved changes indicator
- [ ] Warn before leaving with unsaved changes
- [ ] Persist to localStorage as backup

**Testing**:
- [ ] Auto-save triggers every 30 seconds
- [ ] Save status updates correctly
- [ ] Rapid changes are debounced
- [ ] Errors are handled gracefully
- [ ] Unsaved indicator shows
- [ ] Warning shows before leaving
- [ ] LocalStorage backup works
- [ ] No duplicate saves

#### 5.2 Implement Undo/Redo

**Files to Create**:
- `lib/hooks/useUndoRedo.ts` - Undo/redo hook

**Tasks**:
- [ ] Create undo/redo hook
- [ ] Track change history
- [ ] Implement undo button
- [ ] Implement redo button
- [ ] Limit history to last 50 changes
- [ ] Clear history on save
- [ ] Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)

**Testing**:
- [ ] Undo reverts changes
- [ ] Redo restores changes
- [ ] History limit works
- [ ] Keyboard shortcuts work
- [ ] History clears on save
- [ ] Works with all editors

**Timeline**: 1 day  
**Estimated Effort**: 8 hours

---

### Phase 6: Testing & QA (Week 3, Days 1-3)

**Objective**: Comprehensive testing across all features

#### 6.1 Unit Tests

**Files to Create**:
- `components/admin/editors/__tests__/PageEditor.test.tsx`
- `components/admin/editors/__tests__/SectionCard.test.tsx`
- `components/admin/editors/__tests__/PageMetadataEditor.test.tsx`
- `lib/hooks/__tests__/useAutoSave.test.ts`
- `lib/hooks/__tests__/useUndoRedo.test.ts`

**Tasks**:
- [ ] Test PageEditor component rendering
- [ ] Test SectionCard component rendering
- [ ] Test PageMetadataEditor validation
- [ ] Test useAutoSave hook
- [ ] Test useUndoRedo hook
- [ ] Test API endpoints
- [ ] Test error handling
- [ ] Test edge cases

**Testing Coverage Target**: 80%+

#### 6.2 Integration Tests

**Files to Create**:
- `tests/integration/cms-page-editor.test.ts`
- `tests/integration/section-editing.test.ts`
- `tests/integration/drag-and-drop.test.ts`

**Tasks**:
- [ ] Test full page editing workflow
- [ ] Test section creation workflow
- [ ] Test section editing workflow
- [ ] Test section deletion workflow
- [ ] Test section reordering workflow
- [ ] Test auto-save workflow
- [ ] Test undo/redo workflow
- [ ] Test error recovery

#### 6.3 E2E Tests (Playwright)

**Files to Create**:
- `tests/e2e/cms-page-editor.spec.ts`

**Tasks**:
- [ ] Test navigate to CMS
- [ ] Test navigate to page editor
- [ ] Test edit page metadata
- [ ] Test add section
- [ ] Test edit section
- [ ] Test delete section
- [ ] Test reorder sections
- [ ] Test auto-save
- [ ] Test undo/redo
- [ ] Test save and publish
- [ ] Test error scenarios
- [ ] Test on mobile/tablet

#### 6.4 Manual Testing

**Tasks**:
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on iOS Safari, Android Chrome
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Test with slow internet
- [ ] Test with large content
- [ ] Test concurrent editing (if applicable)
- [ ] Test data persistence

**Timeline**: 3 days  
**Estimated Effort**: 24 hours

---

### Phase 7: Deployment & Documentation (Week 3, Days 4-5)

**Objective**: Deploy to production and document changes

#### 7.1 Pre-Deployment Checklist

**Tasks**:
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code review completed
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] Accessibility audit completed
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness verified
- [ ] Database migrations tested
- [ ] Rollback plan documented

#### 7.2 Deployment

**Tasks**:
- [ ] Create feature branch
- [ ] Merge to staging branch
- [ ] Deploy to staging environment
- [ ] Run smoke tests on staging
- [ ] Get stakeholder approval
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Verify all features working

#### 7.3 Documentation

**Files to Create**:
- `docs/CMS_USER_GUIDE.md` - User guide
- `docs/CMS_DEVELOPER_GUIDE.md` - Developer guide
- `docs/CMS_API_REFERENCE.md` - API reference

**Tasks**:
- [ ] Write user guide with screenshots
- [ ] Write developer guide with architecture
- [ ] Write API reference
- [ ] Create video tutorials
- [ ] Update README
- [ ] Document keyboard shortcuts
- [ ] Document troubleshooting

#### 7.4 Training & Support

**Tasks**:
- [ ] Create training materials
- [ ] Train admin users
- [ ] Set up support channel
- [ ] Monitor for issues
- [ ] Gather feedback
- [ ] Plan improvements

**Timeline**: 2 days  
**Estimated Effort**: 12 hours

---

## Timeline Summary

| Phase | Duration | Start | End | Status |
|-------|----------|-------|-----|--------|
| Phase 1: Foundation & Navigation | 2 days | Week 1, Day 1 | Week 1, Day 2 | ⏳ Pending |
| Phase 2: Page Editor Component | 2 days | Week 1, Day 3 | Week 1, Day 4 | ⏳ Pending |
| Phase 3: Section Editing | 3 days | Week 1, Day 5 | Week 2, Day 2 | ⏳ Pending |
| Phase 4: Drag-and-Drop | 2 days | Week 2, Day 3 | Week 2, Day 4 | ⏳ Pending |
| Phase 5: Auto-Save & State | 1 day | Week 2, Day 5 | Week 2, Day 5 | ⏳ Pending |
| Phase 6: Testing & QA | 3 days | Week 3, Day 1 | Week 3, Day 3 | ⏳ Pending |
| Phase 7: Deployment & Docs | 2 days | Week 3, Day 4 | Week 3, Day 5 | ⏳ Pending |
| **Total** | **15 days** | **Week 1** | **Week 3** | ⏳ Pending |

---

## Testing Strategy

### Unit Testing

**Framework**: Jest  
**Coverage Target**: 80%+

**Test Categories**:
1. Component rendering
2. Props validation
3. State management
4. Event handling
5. Error handling
6. Edge cases

### Integration Testing

**Framework**: Jest + React Testing Library  
**Focus Areas**:
1. Component interactions
2. API integration
3. Data flow
4. Error scenarios
5. State persistence

### E2E Testing

**Framework**: Playwright  
**Test Scenarios**:
1. Complete page editing workflow
2. Section CRUD operations
3. Drag-and-drop reordering
4. Auto-save functionality
5. Undo/redo functionality
6. Error recovery
7. Mobile responsiveness
8. Accessibility

### Manual Testing

**Browsers**: Chrome, Firefox, Safari, Edge  
**Devices**: Desktop, Tablet, Mobile  
**Focus Areas**:
1. Visual design
2. User experience
3. Performance
4. Accessibility
5. Data integrity

### Performance Testing

**Metrics**:
- Page load time < 2 seconds
- Section edit modal opens < 500ms
- Auto-save completes < 1 second
- Drag-and-drop smooth (60 FPS)
- No memory leaks

### Accessibility Testing

**Standards**: WCAG 2.1 AA  
**Focus Areas**:
1. Keyboard navigation
2. Screen reader compatibility
3. Color contrast
4. Focus management
5. ARIA labels

---

## Success Criteria

### User Experience
- ✅ Users can edit page content without confusion
- ✅ Time to edit a section < 2 minutes
- ✅ Intuitive navigation (like WordPress)
- ✅ Visual feedback for all actions
- ✅ Clear error messages

### Technical
- ✅ Zero data loss (auto-save)
- ✅ 80%+ test coverage
- ✅ All E2E tests passing
- ✅ No console errors
- ✅ Performance metrics met

### Quality
- ✅ Code review approved
- ✅ Security audit passed
- ✅ Accessibility audit passed
- ✅ Browser compatibility verified
- ✅ Mobile responsive

### Adoption
- ✅ Admin users trained
- ✅ Documentation complete
- ✅ Support channel active
- ✅ User feedback positive
- ✅ Zero critical bugs in first week

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Drag-and-drop library issues | Medium | High | Test thoroughly, have fallback |
| Rich text editor conflicts | Medium | Medium | Test with existing components |
| Auto-save data loss | Low | Critical | Implement localStorage backup |
| Performance degradation | Medium | High | Profile and optimize early |
| Browser compatibility | Low | Medium | Test on all browsers early |
| User adoption resistance | Medium | Medium | Provide training and support |

---

## Dependencies

### External Libraries
- `react-beautiful-dnd` - Drag and drop
- `@tiptap/react` - Rich text editor
- `zustand` - State management
- `react-query` - Data fetching

### Internal Dependencies
- Supabase API (existing)
- Admin UI components (existing)
- Authentication system (existing)

---

## File Structure

```
components/admin/
├── cms/
│   ├── CMSNavigation.tsx (NEW)
│   ├── CMSBreadcrumb.tsx (NEW)
│   └── PagePreview.tsx (NEW)
├── editors/
│   ├── PageEditor.tsx (NEW)
│   ├── SectionCard.tsx (NEW)
│   ├── SectionEditModal.tsx (REFACTOR)
│   ├── PageMetadataEditor.tsx (NEW)
│   ├── SectionTypeSelector.tsx (NEW)
│   ├── PageContentEditor.tsx (DEPRECATE)
│   ├── sections/
│   │   ├── HeroSectionEditor.tsx (NEW)
│   │   ├── TextSectionEditor.tsx (NEW)
│   │   ├── GallerySectionEditor.tsx (NEW)
│   │   ├── VideoSectionEditor.tsx (NEW)
│   │   └── CustomSectionEditor.tsx (NEW)
│   └── __tests__/
│       ├── PageEditor.test.tsx (NEW)
│       ├── SectionCard.test.tsx (NEW)
│       └── PageMetadataEditor.test.tsx (NEW)
└── ui/
    ├── RichTextEditor.tsx (NEW)
    ├── ImageUploader.tsx (NEW)
    ├── DragHandle.tsx (NEW)
    └── SaveStatus.tsx (NEW)

app/admin/cms/
├── page.tsx (REFACTOR)
├── pages/
│   ├── page.tsx (NEW)
│   └── [slug]/
│       └── page.tsx (NEW)
├── testimonials/
│   └── page.tsx (NEW)
├── faq/
│   └── page.tsx (NEW)
└── analytics/
    └── page.tsx (NEW)

app/api/admin/
├── pages/
│   ├── route.ts (EXISTING)
│   ├── [id]/route.ts (EXISTING)
│   └── [slug]/
│       └── reorder/route.ts (NEW)
└── ...

lib/
├── hooks/
│   ├── useAutoSave.ts (NEW)
│   ├── useUndoRedo.ts (NEW)
│   └── useDragAndDrop.ts (NEW)
└── ...

tests/
├── unit/
│   └── cms/ (NEW)
├── integration/
│   └── cms/ (NEW)
└── e2e/
    └── cms-page-editor.spec.ts (NEW)

docs/
├── CMS_USER_GUIDE.md (NEW)
├── CMS_DEVELOPER_GUIDE.md (NEW)
└── CMS_API_REFERENCE.md (NEW)
```

---

## Next Steps

1. **Review Plan**: Get stakeholder approval
2. **Setup**: Create feature branch and setup development environment
3. **Phase 1**: Begin with navigation restructuring
4. **Daily Standups**: 15-minute daily progress updates
5. **Weekly Reviews**: Review completed phases and adjust timeline
6. **Testing**: Run tests at end of each phase
7. **Deployment**: Follow deployment checklist before going live

---

## Questions & Clarifications

- [ ] Should we support concurrent editing?
- [ ] Do we need version control/revision history?
- [ ] Should sections have scheduling (publish at specific time)?
- [ ] Do we need bulk operations?
- [ ] Should we support page templates?
- [ ] Do we need content approval workflow?

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | TBD | - | - |
| Tech Lead | TBD | - | - |
| QA Lead | TBD | - | - |

---

**Document Status**: DRAFT - Ready for Review  
**Last Updated**: November 8, 2025  
**Next Review**: After stakeholder approval
