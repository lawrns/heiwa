import React from 'react';
import { Metadata } from 'next';
import {
  Palette,
  Type,
  MousePointer2,
  Layout,
  AlertCircle,
  Loader2,
  Smartphone,
  Box,
  CheckCircle2,
  AlertTriangle,
  Info,
  Home,
  Menu,
  X,
  Edit,
  Trash2,
  Plus,
  Save,
  Search,
  User,
  Settings,
  File,
  Folder,
  Bed,
  Users,
  Calendar,
  Star,
  ArrowRight,
  Layers,
  Move,
  Play,
  Monitor,
  ExternalLink,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Section } from '@/components/design-system/Section';
import { ColorSwatch } from '@/components/design-system/ColorSwatch';
import { TypographyScale } from '@/components/design-system/TypographyScale';
import { ComponentShowcase } from '@/components/design-system/ComponentShowcase';
import { CodeBlock } from '@/components/design-system/CodeBlock';
import { DarkModeToggle } from '@/components/design-system/DarkModeToggle';
import { SpacingScale } from '@/components/design-system/SpacingScale';
import { ShadowShowcase } from '@/components/design-system/ShadowShowcase';
import { RadiusShowcase } from '@/components/design-system/RadiusShowcase';
import { AnimationDemo } from '@/components/design-system/AnimationDemo';
import { BreakpointDiagram } from '@/components/design-system/BreakpointDiagram';
import { ComponentTabs } from '@/components/design-system/ComponentTabs';

export const metadata: Metadata = {
  title: 'Design System | Heiwa House',
  description: 'Single source of truth for UI components, colors, typography, and patterns.',
};

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Palette className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Heiwa Design System</h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex gap-6 text-sm font-medium">
              <a href="#colors" className="text-gray-500 hover:text-primary transition-colors">Colors</a>
              <a href="#typography" className="text-gray-500 hover:text-primary transition-colors">Typography</a>
              <a href="#spacing" className="text-gray-500 hover:text-primary transition-colors">Spacing</a>
              <a href="#components" className="text-gray-500 hover:text-primary transition-colors">Components</a>
            </nav>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <a
                href="/"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View Site
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 flex flex-col lg:flex-row gap-10 py-10">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-56 shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="font-semibold mb-3 px-3 text-xs text-gray-400 uppercase tracking-wider">Foundation</h3>
              <nav className="space-y-0.5">
                <NavLink href="#colors" icon={Palette}>Colors</NavLink>
                <NavLink href="#typography" icon={Type}>Typography</NavLink>
                <NavLink href="#spacing" icon={Move}>Spacing</NavLink>
                <NavLink href="#shadows" icon={Layers}>Shadows</NavLink>
                <NavLink href="#radius" icon={Box}>Border Radius</NavLink>
                <NavLink href="#motion" icon={Play}>Motion</NavLink>
                <NavLink href="#breakpoints" icon={Monitor}>Breakpoints</NavLink>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold mb-3 px-3 text-xs text-gray-400 uppercase tracking-wider">Components</h3>
              <nav className="space-y-0.5">
                <NavLink href="#buttons" icon={MousePointer2}>Buttons</NavLink>
                <NavLink href="#inputs" icon={Edit}>Forms</NavLink>
                <NavLink href="#cards" icon={Layout}>Cards</NavLink>
                <NavLink href="#alerts" icon={AlertCircle}>Alerts</NavLink>
                <NavLink href="#loading" icon={Loader2}>Progress</NavLink>
                <NavLink href="#badges" icon={Star}>Badges</NavLink>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold mb-3 px-3 text-xs text-gray-400 uppercase tracking-wider">Patterns</h3>
              <nav className="space-y-0.5">
                <NavLink href="#icons" icon={Box}>Icons</NavLink>
                <NavLink href="#accessibility" icon={Smartphone}>Accessibility</NavLink>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 max-w-4xl">
          {/* Hero */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Design System</h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              A living reference for the Heiwa House visual language. Use this guide to build consistent, beautiful interfaces.
            </p>
          </div>

          {/* FOUNDATION SECTIONS */}

          <Section id="colors" title="Colors" description="Our color palette reflects the ocean, sand, and sunset themes of Heiwa House. Click any value to copy.">

            <h3 className="text-lg font-semibold mb-4 mt-8">Primary (Ocean)</h3>
            <ComponentShowcase grid cols={3}>
              <ColorSwatch name="Primary" hex="#2B5F75" variable="--color-primary" tailwindClass="bg-primary" usage="Main brand color, headers, primary actions" textColor="white" />
              <ColorSwatch name="Primary Light" hex="#4A9DB5" variable="--color-primary-light" tailwindClass="bg-primary-light" usage="Hover states, illustrations" textColor="black" />
              <ColorSwatch name="Primary Dark" hex="#1A4252" variable="--color-primary-dark" tailwindClass="bg-primary-dark" usage="Active states, footers" textColor="white" />
            </ComponentShowcase>

            <h3 className="text-lg font-semibold mb-4 mt-10">Secondary (Sand)</h3>
            <ComponentShowcase grid cols={3}>
              <ColorSwatch name="Secondary" hex="#D4C5A9" variable="--color-secondary" tailwindClass="bg-secondary" usage="Backgrounds, cards, warm accents" textColor="black" />
              <ColorSwatch name="Secondary Light" hex="#E8DCC4" variable="--color-secondary-light" tailwindClass="bg-secondary-light" usage="Light backgrounds" textColor="black" />
              <ColorSwatch name="Secondary Dark" hex="#B8A88C" variable="--color-secondary-dark" tailwindClass="bg-secondary-dark" usage="Borders, secondary text" textColor="black" />
            </ComponentShowcase>

            <h3 className="text-lg font-semibold mb-4 mt-10">Accent (Sunset)</h3>
            <ComponentShowcase grid cols={4}>
              <ColorSwatch name="Accent" hex="#ec681c" variable="--color-accent" tailwindClass="bg-accent" usage="CTAs, highlights, links" textColor="white" />
              <ColorSwatch name="Accent Hover" hex="#d65d16" variable="--color-accent-hover" tailwindClass="hover:bg-accent-hover" usage="Button hover states" textColor="white" />
              <ColorSwatch name="Accent Dark" hex="#b8491a" variable="--color-accent-dark" tailwindClass="bg-accent-dark" usage="Active states" textColor="white" />
              <ColorSwatch name="Accent Light" hex="rgba(236, 104, 28, 0.1)" variable="--color-accent-light" tailwindClass="bg-accent/10" usage="Background tints" textColor="black" />
            </ComponentShowcase>

            <h3 className="text-lg font-semibold mb-4 mt-10">Status</h3>
            <ComponentShowcase grid cols={4}>
              <ColorSwatch name="Success" hex="#16a34a" variable="--color-success" tailwindClass="bg-success" usage="Success states, confirmations" textColor="white" />
              <ColorSwatch name="Warning" hex="#d97706" variable="--color-warning" tailwindClass="bg-warning" usage="Warnings, attention needed" textColor="white" />
              <ColorSwatch name="Error" hex="#dc2626" variable="--color-error" tailwindClass="bg-error" usage="Errors, destructive actions" textColor="white" />
              <ColorSwatch name="Info" hex="#2563eb" variable="--color-info" tailwindClass="bg-info" usage="Information, links" textColor="white" />
            </ComponentShowcase>

            <h3 className="text-lg font-semibold mb-4 mt-10">Surfaces & Text</h3>
            <ComponentShowcase grid cols={3}>
              <ColorSwatch name="Surface" hex="#FFFFFF" variable="--color-surface" tailwindClass="bg-surface" usage="Page background, cards" />
              <ColorSwatch name="Surface Alt" hex="#F9F7F4" variable="--color-surface-alt" tailwindClass="bg-surface-alt" usage="Section backgrounds" />
              <ColorSwatch name="Text" hex="#1A1A1A" variable="--color-text" tailwindClass="text-gray-900" usage="Primary content" textColor="white" />
            </ComponentShowcase>
          </Section>

          <Section id="typography" title="Typography" description="We use system fonts for optimal performance. The scale provides clear hierarchy from hero text to captions.">
            <TypographyScale />
          </Section>

          <Section id="spacing" title="Spacing & Layout" description="Consistent spacing creates visual rhythm. Based on a 4px grid with semantic tokens for common patterns.">
            <SpacingScale />
          </Section>

          <Section id="shadows" title="Shadows & Elevation" description="Three elevation levels create depth and hierarchy. Use sparingly for emphasis.">
            <ShadowShowcase />
          </Section>

          <Section id="radius" title="Border Radius" description="Consistent corner rounding creates a cohesive feel. Match radius to element size and purpose.">
            <RadiusShowcase />
          </Section>

          <Section id="motion" title="Animation & Motion" description="Subtle motion adds polish and provides feedback. Always respect reduced-motion preferences.">
            <AnimationDemo />
          </Section>

          <Section id="breakpoints" title="Responsive Breakpoints" description="Mobile-first breakpoints for adaptive layouts. Design for mobile, then enhance for larger screens.">
            <BreakpointDiagram />
          </Section>

          {/* COMPONENT SECTIONS */}

          <div className="h-px bg-gray-200 my-16" />
          <h2 className="text-2xl font-bold tracking-tight mb-2">Components</h2>
          <p className="text-gray-600 mb-12">Reusable UI elements built on our foundation tokens.</p>

          <Section id="buttons" title="Buttons" description="Button components for various actions and emphasis levels.">
            <h3 className="text-base font-medium mb-4">Variants</h3>
            <ComponentTabs
              preview={
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="default">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
              }
              code={`<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>`}
            />

            <h3 className="text-base font-medium mb-4 mt-10">Sizes</h3>
            <ComponentTabs
              preview={
                <div className="flex flex-wrap gap-4 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon" aria-label="Search"><Search className="h-4 w-4" /></Button>
                </div>
              }
              code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Search className="h-4 w-4" /></Button>`}
            />

            <h3 className="text-base font-medium mb-4 mt-10">With Icons</h3>
            <ComponentTabs
              preview={
                <div className="flex flex-wrap gap-4 items-center">
                  <Button><Calendar className="mr-2 h-4 w-4" /> Book Now</Button>
                  <Button variant="secondary">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  <Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button>
                </div>
              }
              code={`<Button><Calendar className="mr-2 h-4 w-4" /> Book Now</Button>
<Button variant="secondary">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
<Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button>`}
            />

            <h3 className="text-base font-medium mb-4 mt-10">States</h3>
            <ComponentShowcase className="flex flex-wrap gap-4 items-center">
              <Button>Default</Button>
              <Button className="ring-2 ring-primary ring-offset-2">Focused</Button>
              <Button disabled>Disabled</Button>
              <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading</Button>
            </ComponentShowcase>
          </Section>

          <Section id="inputs" title="Form Inputs" description="Input fields and form elements for data collection.">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-base font-medium">Text Inputs</h3>
                <ComponentShowcase className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default</label>
                    <Input type="email" placeholder="hello@heiwahouse.com" />
                    <p className="text-xs text-gray-500">Helper text goes here.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-red-600">Error State</label>
                    <Input type="text" defaultValue="Invalid" className="border-red-500 focus-visible:ring-red-500" />
                    <p className="text-xs text-red-500">Please enter a valid value.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Disabled</label>
                    <Input disabled placeholder="Cannot edit" />
                  </div>
                </ComponentShowcase>
              </div>

              <div className="space-y-6">
                <h3 className="text-base font-medium">Selection Controls</h3>
                <ComponentShowcase className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="terms" />
                    <label htmlFor="terms" className="text-sm">Accept terms and conditions</label>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Room Type</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input type="radio" name="room" id="r1" className="h-4 w-4 text-primary focus:ring-primary" />
                        <label htmlFor="r1" className="text-sm">Private Room</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="radio" name="room" id="r2" className="h-4 w-4 text-primary focus:ring-primary" />
                        <label htmlFor="r2" className="text-sm">Shared Dorm</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="surf">Surf Package</SelectItem>
                        <SelectItem value="stay">Stay Only</SelectItem>
                        <SelectItem value="retreat">Yoga Retreat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </ComponentShowcase>
              </div>
            </div>
          </Section>

          <Section id="cards" title="Cards" description="Containers for grouping related content and actions.">
            <div className="grid md:grid-cols-2 gap-6">
              <ComponentTabs
                preview={
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Card</CardTitle>
                      <CardDescription>A simple content container.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">Cards group related information with consistent padding, borders, and shadows.</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">Action</Button>
                    </CardFooter>
                  </Card>
                }
                code={`<Card>
  <CardHeader>
    <CardTitle>Basic Card</CardTitle>
    <CardDescription>A simple content container.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline" size="sm">Action</Button>
  </CardFooter>
</Card>`}
              />

              <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Interactive Card</CardTitle>
                      <CardDescription>With hover effects</CardDescription>
                    </div>
                    <Star className="h-5 w-5 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Lift effect and shadow change on hover indicates interactivity. Left border shows status.</p>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section id="alerts" title="Alerts & Notifications" description="Feedback components for success, error, warning, and informational messages.">
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  General information that doesn&apos;t require immediate action.
                </AlertDescription>
              </Alert>

              <div className="relative w-full rounded-lg border border-green-200 bg-green-50 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <h5 className="mb-1 font-medium leading-none tracking-tight">Success</h5>
                <div className="text-sm opacity-90">Your booking has been confirmed.</div>
              </div>

              <div className="relative w-full rounded-lg border border-yellow-200 bg-yellow-50 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 text-yellow-800">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <h5 className="mb-1 font-medium leading-none tracking-tight">Warning</h5>
                <div className="text-sm opacity-90">Only 2 spots left for this surf week.</div>
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Something went wrong. Please try again.
                </AlertDescription>
              </Alert>
            </div>
          </Section>

          <Section id="loading" title="Progress & Loading" description="Indicators for async operations and loading states.">
            <ComponentShowcase className="flex flex-wrap gap-8 items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <span className="text-xs text-gray-500">Primary</span>
              </div>
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-2" />
                <span className="text-xs text-gray-500">Accent</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </div>
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </Button>
            </ComponentShowcase>
          </Section>

          <Section id="badges" title="Badges" description="Small status indicators and labels.">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium mb-4">Standard Variants</h3>
                <ComponentShowcase className="flex gap-3 flex-wrap">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </ComponentShowcase>
              </div>

              <div>
                <h3 className="text-base font-medium mb-4">Availability Badges</h3>
                <ComponentShowcase className="flex gap-3 flex-wrap">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80 border-transparent">Available</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-transparent">Low Stock</Badge>
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100/80 border-transparent">Sold Out</Badge>
                </ComponentShowcase>
              </div>
            </div>
          </Section>

          {/* PATTERNS SECTIONS */}

          <div className="h-px bg-gray-200 my-16" />
          <h2 className="text-2xl font-bold tracking-tight mb-2">Patterns</h2>
          <p className="text-gray-600 mb-12">Guidelines and best practices for common UI patterns.</p>

          <Section id="icons" title="Icons" description="We use Lucide React for iconography. Icons should be clear, simple, and consistently sized.">
            <h3 className="text-base font-medium mb-4">Core Actions</h3>
            <ComponentShowcase className="flex gap-8 flex-wrap">
              <IconDisplay icon={Edit} name="Edit" />
              <IconDisplay icon={Trash2} name="Delete" />
              <IconDisplay icon={Plus} name="Add" />
              <IconDisplay icon={Save} name="Save" />
              <IconDisplay icon={Search} name="Search" />
              <IconDisplay icon={X} name="Close" />
            </ComponentShowcase>

            <h3 className="text-base font-medium mb-4 mt-10">Navigation</h3>
            <ComponentShowcase className="flex gap-8 flex-wrap">
              <IconDisplay icon={Home} name="Home" />
              <IconDisplay icon={Menu} name="Menu" />
              <IconDisplay icon={User} name="User" />
              <IconDisplay icon={Settings} name="Settings" />
              <IconDisplay icon={File} name="File" />
              <IconDisplay icon={Folder} name="Folder" />
            </ComponentShowcase>

            <h3 className="text-base font-medium mb-4 mt-10">Domain Specific</h3>
            <ComponentShowcase className="flex gap-8 flex-wrap text-primary">
              <IconDisplay icon={Bed} name="Room" />
              <IconDisplay icon={Users} name="Guests" />
              <IconDisplay icon={Calendar} name="Booking" />
              <IconDisplay icon={Star} name="Review" />
            </ComponentShowcase>

            <h3 className="text-base font-medium mb-4 mt-10">Size Scale</h3>
            <ComponentShowcase className="flex gap-8 items-end">
              <div className="text-center">
                <Search className="h-4 w-4 mx-auto mb-2" />
                <span className="text-xs text-gray-500">16px</span>
              </div>
              <div className="text-center">
                <Search className="h-5 w-5 mx-auto mb-2" />
                <span className="text-xs text-gray-500">20px</span>
              </div>
              <div className="text-center">
                <Search className="h-6 w-6 mx-auto mb-2" />
                <span className="text-xs text-gray-500">24px</span>
              </div>
              <div className="text-center">
                <Search className="h-8 w-8 mx-auto mb-2" />
                <span className="text-xs text-gray-500">32px</span>
              </div>
            </ComponentShowcase>
          </Section>

          <Section id="accessibility" title="Accessibility" description="Guidelines to ensure the application is usable by everyone.">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Touch Targets</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-11 h-11 bg-accent/10 border-2 border-accent border-dashed flex items-center justify-center text-xs text-accent font-mono rounded">44px</div>
                    <p className="text-sm text-gray-600">Minimum touch target for interactive elements.</p>
                  </div>
                  <p className="text-sm text-gray-500">Ensures buttons and links are easily tappable on mobile devices.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Focus Indicators</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-shadow">
                      Tab to focus
                    </button>
                    <p className="text-sm text-gray-500">Visible focus states enable keyboard navigation. Use 2px ring with offset.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Color Contrast</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-900 rounded" />
                      <span className="text-sm">Text on white: 15.6:1</span>
                      <Badge className="bg-green-100 text-green-800 text-xs">AAA</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded" />
                      <span className="text-sm">Primary on white: 5.9:1</span>
                      <Badge className="bg-green-100 text-green-800 text-xs">AA</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Minimum 4.5:1 for normal text, 3:1 for large text.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Reduced Motion</CardTitle></CardHeader>
                <CardContent>
                  <CodeBlock code={`@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`} />
                  <p className="text-sm text-gray-500 mt-4">Respect user preference for reduced motion.</p>
                </CardContent>
              </Card>
            </div>
          </Section>

        </main>
      </div>
    </div>
  );
}

function NavLink({ href, icon: Icon, children }: { href: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      <Icon className="h-4 w-4" />
      {children}
    </a>
  );
}

function IconDisplay({ icon: Icon, name }: { icon: React.ElementType; name: string }) {
  return (
    <div className="text-center">
      <Icon className="mx-auto mb-2 h-6 w-6" />
      <span className="text-xs text-gray-500">{name}</span>
    </div>
  );
}
