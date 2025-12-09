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
  Check,
  Waves,
  Clock,
  DollarSign,
  Image as ImageIcon,
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
            <div>
              <h3 className="font-semibold mb-3 px-3 text-xs text-gray-400 uppercase tracking-wider">App Components</h3>
              <nav className="space-y-0.5">
                <NavLink href="#booking-components" icon={Calendar}>Booking</NavLink>
                <NavLink href="#surf-components" icon={Waves}>Surf Weeks</NavLink>
                <NavLink href="#room-activity-components" icon={Bed}>Rooms</NavLink>
                <NavLink href="#review-components" icon={Star}>Reviews</NavLink>
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

            {/* HEIWA ORANGE - THE HERO */}
            <div className="bg-gradient-to-br from-heiwaOrange-500 to-heiwaOrange-600 rounded-2xl p-8 mb-10 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Waves className="h-8 w-8" />
                <h3 className="text-2xl font-bold">Heiwa Orange — Primary Brand Color</h3>
              </div>
              <p className="text-white/90 mb-6 max-w-2xl">
                Heiwa Orange is the heart of our visual identity. It represents the warmth of sunset over the ocean and the energy of surf culture. Use it for all primary CTAs, buttons, and key interactive elements.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-heiwaOrange-50 rounded-lg p-3 text-center">
                  <div className="text-gray-900 font-mono text-xs mb-1">50</div>
                  <div className="text-gray-600 font-mono text-[10px]">#fff7ed</div>
                </div>
                <div className="bg-heiwaOrange-100 rounded-lg p-3 text-center">
                  <div className="text-gray-900 font-mono text-xs mb-1">100</div>
                  <div className="text-gray-600 font-mono text-[10px]">#ffedd5</div>
                </div>
                <div className="bg-heiwaOrange-200 rounded-lg p-3 text-center">
                  <div className="text-gray-900 font-mono text-xs mb-1">200</div>
                  <div className="text-gray-600 font-mono text-[10px]">#fed7aa</div>
                </div>
                <div className="bg-heiwaOrange-300 rounded-lg p-3 text-center">
                  <div className="text-gray-900 font-mono text-xs mb-1">300</div>
                  <div className="text-gray-600 font-mono text-[10px]">#fdba74</div>
                </div>
                <div className="bg-heiwaOrange-400 rounded-lg p-3 text-center">
                  <div className="text-gray-900 font-mono text-xs mb-1">400</div>
                  <div className="text-gray-600 font-mono text-[10px]">#fb923c</div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                <div className="bg-heiwaOrange-500 rounded-lg p-3 text-center ring-2 ring-white ring-offset-2 ring-offset-heiwaOrange-500">
                  <div className="text-white font-mono text-xs mb-1 font-bold">500 ★</div>
                  <div className="text-white/80 font-mono text-[10px]">#f97316</div>
                </div>
                <div className="bg-heiwaOrange-600 rounded-lg p-3 text-center">
                  <div className="text-white font-mono text-xs mb-1">600</div>
                  <div className="text-white/80 font-mono text-[10px]">#ea580c</div>
                </div>
                <div className="bg-heiwaOrange-700 rounded-lg p-3 text-center">
                  <div className="text-white font-mono text-xs mb-1">700</div>
                  <div className="text-white/80 font-mono text-[10px]">#c2410c</div>
                </div>
                <div className="bg-heiwaOrange-800 rounded-lg p-3 text-center">
                  <div className="text-white font-mono text-xs mb-1">800</div>
                  <div className="text-white/80 font-mono text-[10px]">#9a3412</div>
                </div>
                <div className="bg-heiwaOrange-900 rounded-lg p-3 text-center">
                  <div className="text-white font-mono text-xs mb-1">900</div>
                  <div className="text-white/80 font-mono text-[10px]">#7c2d12</div>
                </div>
              </div>
            </div>

            {/* Usage Examples */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold mb-4">Heiwa Orange in Action</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <Button className="bg-heiwaOrange-500 hover:bg-heiwaOrange-600">Book Now</Button>
                  <Button className="bg-heiwaOrange-600 hover:bg-heiwaOrange-700">Check Availability</Button>
                  <Badge className="bg-heiwaOrange-100 text-heiwaOrange-800 border-transparent">Featured</Badge>
                  <span className="text-heiwaOrange-600 font-semibold">€450/night</span>
                  <div className="w-10 h-10 rounded-full bg-heiwaOrange-500 flex items-center justify-center text-white">
                    <Star className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Primary (Ocean)</h3>
            <ComponentShowcase grid cols={3}>
              <ColorSwatch name="Primary" hex="#2B5F75" variable="--color-primary" tailwindClass="bg-primary" usage="Secondary brand color, headers" textColor="white" />
              <ColorSwatch name="Primary Light" hex="#4A9DB5" variable="--color-primary-light" tailwindClass="bg-primary-light" usage="Hover states, illustrations" textColor="black" />
              <ColorSwatch name="Primary Dark" hex="#1A4252" variable="--color-primary-dark" tailwindClass="bg-primary-dark" usage="Active states, footers" textColor="white" />
            </ComponentShowcase>

            <h3 className="text-lg font-semibold mb-4 mt-10">Secondary (Sand)</h3>
            <ComponentShowcase grid cols={3}>
              <ColorSwatch name="Secondary" hex="#D4C5A9" variable="--color-secondary" tailwindClass="bg-secondary" usage="Backgrounds, cards, warm accents" textColor="black" />
              <ColorSwatch name="Secondary Light" hex="#E8DCC4" variable="--color-secondary-light" tailwindClass="bg-secondary-light" usage="Light backgrounds" textColor="black" />
              <ColorSwatch name="Secondary Dark" hex="#B8A88C" variable="--color-secondary-dark" tailwindClass="bg-secondary-dark" usage="Borders, secondary text" textColor="black" />
            </ComponentShowcase>

            <h3 className="text-lg font-semibold mb-4 mt-10">Status Colors</h3>
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
                    <div className="w-11 h-11 bg-heiwaOrange-100 border-2 border-heiwaOrange-500 border-dashed flex items-center justify-center text-xs text-heiwaOrange-600 font-mono rounded">44px</div>
                    <p className="text-sm text-gray-600">Minimum touch target for interactive elements.</p>
                  </div>
                  <p className="text-sm text-gray-500">Ensures buttons and links are easily tappable on mobile devices.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Focus Indicators</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-heiwaOrange-500 focus:ring-offset-2 transition-shadow">
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
                      <div className="w-4 h-4 bg-heiwaOrange-500 rounded" />
                      <span className="text-sm">Orange on white: 3.5:1</span>
                      <Badge className="bg-green-100 text-green-800 text-xs">AA Large</Badge>
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

          {/* APPLICATION-SPECIFIC COMPONENTS */}
          
          <div className="h-px bg-gray-200 my-16" />
          <h2 className="text-2xl font-bold tracking-tight mb-2">Application Components</h2>
          <p className="text-gray-600 mb-12">Domain-specific components unique to Heiwa House.</p>

          <Section id="booking-components" title="Booking Flow Components" description="Components used in the multi-step booking widget.">
            {/* Progress Indicator */}
            <h3 className="text-base font-medium mb-4">Progress Stepper</h3>
            <ComponentShowcase>
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-center gap-4">
                  {['Experience', 'Options', 'Add-ons', 'Details', 'Review'].map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index < 2 
                          ? 'bg-gradient-to-br from-heiwaOrange-500 to-heiwaOrange-600 text-white' 
                          : index === 2 
                            ? 'bg-gradient-to-br from-heiwaOrange-500 to-heiwaOrange-600 text-white ring-2 ring-heiwaOrange-300 ring-offset-2'
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index < 2 ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                      <span className={`ml-2 text-sm hidden sm:inline ${index <= 2 ? 'text-heiwaOrange-600 font-medium' : 'text-gray-500'}`}>
                        {step}
                      </span>
                      {index < 4 && <div className={`w-8 h-0.5 mx-2 ${index < 2 ? 'bg-heiwaOrange-500' : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                </div>
              </div>
            </ComponentShowcase>

            {/* Experience Cards */}
            <h3 className="text-base font-medium mb-4 mt-10">Experience Selection Cards</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-heiwaOrange-500 to-heiwaOrange-600 p-6 text-white cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <Waves className="h-10 w-10 mb-4" />
                <h4 className="text-xl font-bold mb-2">Surf Week Package</h4>
                <p className="text-white/80 text-sm mb-4">7 days of surf, yoga, and community</p>
                <div className="text-2xl font-bold">From €450</div>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <Bed className="h-10 w-10 mb-4" />
                <h4 className="text-xl font-bold mb-2">Room Only</h4>
                <p className="text-white/80 text-sm mb-4">Flexible stays at our beachfront house</p>
                <div className="text-2xl font-bold">From €35/night</div>
              </div>
            </div>

            {/* Room Selection Card */}
            <h3 className="text-base font-medium mb-4 mt-10">Room Selection Card</h3>
            <ComponentShowcase>
              <div className="max-w-md">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-heiwaOrange-100 to-heiwaOrange-200 flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-heiwaOrange-400" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">Ocean View Private</h4>
                      <Badge className="bg-green-100 text-green-800 border-transparent text-xs">Available</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Private room with stunning ocean views</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> 2 guests</span>
                      <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> Queen bed</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-heiwaOrange-600">€65</span>
                        <span className="text-gray-500 text-sm">/night</span>
                      </div>
                      <Button size="sm" className="bg-heiwaOrange-500 hover:bg-heiwaOrange-600">Select</Button>
                    </div>
                  </div>
                </div>
              </div>
            </ComponentShowcase>
          </Section>

          <Section id="surf-components" title="Surf Week Components" description="Components for surf week promotions and bookings.">
            {/* Surf Week Promo Card */}
            <h3 className="text-base font-medium mb-4">Surf Week Promo Card</h3>
            <ComponentShowcase>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 max-w-2xl">
                <div className="text-center py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">March 15th to March 22nd, 2025!</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 text-gray-900 mb-6">
                    <li className="flex items-start gap-3">
                      <span className="text-heiwaOrange-500 font-semibold">-</span>
                      <span className="italic">Professional instructors for all levels</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-heiwaOrange-500 font-semibold">-</span>
                      <span className="italic">Amazing food prepared by our chef</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-heiwaOrange-500 font-semibold">-</span>
                      <span className="italic">Daily yoga and meditation sessions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-heiwaOrange-500 font-semibold">-</span>
                      <span className="italic">Prices starting from EUR 450!</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-heiwaOrange-500 hover:bg-heiwaOrange-600 text-lg py-6">
                    Book Now
                  </Button>
                  <div className="flex items-center gap-2 mt-4 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">5 based on 73 reviews</span>
                  </div>
                </div>
              </div>
            </ComponentShowcase>
          </Section>

          <Section id="room-activity-components" title="Room & Activity Components" description="Cards and badges for rooms and activities.">
            {/* Activity Card */}
            <h3 className="text-base font-medium mb-4">Activity Card</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Surfing', 'Yoga', 'Skateboarding'].map((activity) => (
                <div key={activity} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all">
                  <div className="aspect-[4/3] bg-gradient-to-br from-heiwaOrange-300 to-heiwaOrange-500" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white">{activity}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Availability Badges */}
            <h3 className="text-base font-medium mb-4 mt-10">Availability Badges</h3>
            <ComponentShowcase className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge className="flex items-center gap-1 bg-heiwaOrange-500 text-white">
                  <CheckCircle2 className="w-3 h-3" />
                  Always Available
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  On Request
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Seasonal
                </Badge>
              </div>
            </ComponentShowcase>

            {/* Price Badges */}
            <h3 className="text-base font-medium mb-4 mt-10">Price Badges</h3>
            <ComponentShowcase>
              <div className="flex gap-6 items-center">
                <div className="relative w-32 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg">
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded font-semibold">
                    65€
                  </div>
                </div>
                <div className="relative w-32 h-24 bg-gradient-to-br from-heiwaOrange-100 to-heiwaOrange-200 rounded-lg">
                  <div className="absolute top-2 right-2 bg-heiwaOrange-500 text-white text-sm px-3 py-1.5 rounded font-semibold">
                    450€
                  </div>
                </div>
              </div>
            </ComponentShowcase>
          </Section>

          <Section id="review-components" title="Review Components" description="Google reviews and testimonials display.">
            {/* Review Card */}
            <h3 className="text-base font-medium mb-4">Review Card</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">G</div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-900 text-sm">Sarah M.</span>
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-xs text-gray-500">2 weeks ago</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Amazing experience! The surf lessons were top-notch and the house has such a peaceful vibe. Can&apos;t wait to come back!
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">G</div>
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">Tom K.</span>
                      <span className="text-xs text-gray-500 block">1 month ago</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Perfect place for a surf retreat. Great instructors, delicious food, and met some wonderful people!
                </p>
              </div>
            </div>

            {/* Google Reviews Summary */}
            <h3 className="text-base font-medium mb-4 mt-10">Reviews Summary Header</h3>
            <ComponentShowcase>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center text-white font-bold">G</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Reviews</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">5.0</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">(73)</span>
                    </div>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">Review us on Google</Button>
              </div>
            </ComponentShowcase>
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
