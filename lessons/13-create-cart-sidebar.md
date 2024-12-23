# 13-create-cart-sidebar

1. lib/utils.ts

   ```ts
   // PROMPT: [ChatGTP] create toSlug ts arrow function that convert text to lowercase, remove non-word,
   // non-whitespace, non-hyphen characters, replace whitespace, trim leading hyphens and trim trailing hyphens.
   // Also replace repeated hyphens in middle with single hyphen

   export const toSlug = (text: string): string =>
     text
       .toLowerCase()
       .replace(/[^\w\s-]+/g, '')
       .replace(/\s+/g, '-')
       .replace(/-+/g, '-')
       .replace(/^-+|-+$/g, '')
   ```

2. npx shadcn@latest add scroll-area
3. components/shared/cart-sidebar.tsx

   ```tsx
   import useCartStore from '@/hooks/use-cart-store'
   import { cn } from '@/lib/utils'
   import Link from 'next/link'
   import React from 'react'
   import { Button, buttonVariants } from '../ui/button'
   import { Separator } from '../ui/separator'
   import { ScrollArea } from '../ui/scroll-area'
   import Image from 'next/image'
   import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
   } from '../ui/select'
   import { TrashIcon } from 'lucide-react'
   import ProductPrice from './product/product-price'
   import { FREE_SHIPPING_MIN_PRICE } from '@/lib/constants'

   export default function CartSidebar() {
     const {
       cart: { items, itemsPrice },
       updateItem,
       removeItem,
     } = useCartStore()

     return (
       <div className='w-36 overflow-y-auto'>
         <div className={`fixed border-l h-full`}>
           <div className='p-2 h-full flex flex-col gap-2 justify-start items-center'>
             <div className='text-center space-y-2'>
               <div> Subtotal</div>
               <div className='font-bold'>
                 <ProductPrice price={itemsPrice} plain />
               </div>
               {itemsPrice > FREE_SHIPPING_MIN_PRICE && (
                 <div className=' text-center text-xs'>
                   Your order qualifies for FREE Shipping
                 </div>
               )}

               <Link
                 className={cn(
                   buttonVariants({ variant: 'outline' }),
                   'rounded-full hover:no-underline w-full'
                 )}
                 href='/cart'
               >
                 Go to Cart
               </Link>
               <Separator className='mt-3' />
             </div>

             <ScrollArea className='flex-1  w-full'>
               {items.map((item) => (
                 <div key={item.clientId}>
                   <div className='my-3'>
                     <Link href={`/product/${item.slug}`}>
                       <div className='relative h-24'>
                         <Image
                           src={item.image}
                           alt={item.name}
                           fill
                           sizes='20vw'
                           className='object-contain'
                         />
                       </div>
                     </Link>
                     <div className='text-sm text-center font-bold'>
                       <ProductPrice price={item.price} plain />
                     </div>
                     <div className='flex gap-2 mt-2'>
                       <Select
                         value={item.quantity.toString()}
                         onValueChange={(value) => {
                           updateItem(item, Number(value))
                         }}
                       >
                         <SelectTrigger className='text-xs w-12 ml-1 h-auto py-0'>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {Array.from({ length: item.countInStock }).map(
                             (_, i) => (
                               <SelectItem
                                 value={(i + 1).toString()}
                                 key={i + 1}
                               >
                                 {i + 1}
                               </SelectItem>
                             )
                           )}
                         </SelectContent>
                       </Select>
                       <Button
                         variant={'outline'}
                         size={'sm'}
                         onClick={() => {
                           removeItem(item)
                         }}
                       >
                         <TrashIcon className='w-4 h-4' />
                       </Button>
                     </div>
                   </div>
                   <Separator />
                 </div>
               ))}
             </ScrollArea>
           </div>
         </div>
       </div>
     )
   }
   ```

4. hooks/use-device-type.ts

   ```tsx
   import { useState, useEffect } from 'react'

   function useDeviceType() {
     const [deviceType, setDeviceType] = useState('unknown')

     useEffect(() => {
       const handleResize = () => {
         setDeviceType(window.innerWidth <= 768 ? 'mobile' : 'desktop')
       }

       handleResize() // Set initial value
       window.addEventListener('resize', handleResize)

       return () => window.removeEventListener('resize', handleResize)
     }, [])

     return deviceType
   }

   export default useDeviceType
   ```

5. hooks/use-cart-sidebar.ts

   ```ts
   import { usePathname } from 'next/navigation'
   import useDeviceType from './use-device-type'
   import useCartStore from './use-cart-store'

   const isNotInPaths = (s: string) =>
     !/^\/$|^\/cart$|^\/checkout$|^\/sign-in$|^\/sign-up$|^\/order(\/.*)?$|^\/account(\/.*)?$|^\/admin(\/.*)?$/.test(
       s
     )
   function useCartSidebar() {
     const {
       cart: { items },
     } = useCartStore()
     const deviceType = useDeviceType()
     const currentPath = usePathname()

     return (
       items.length > 0 && deviceType === 'desktop' && isNotInPaths(currentPath)
     )
   }

   export default useCartSidebar
   ```

6. components/shared/header/cart-button.tsx

   ```tsx
   'use client'

   import { ShoppingCartIcon } from 'lucide-react'
   import Link from 'next/link'
   import useIsMounted from '@/hooks/use-is-mounted'
   import { cn } from '@/lib/utils'
   import useCartStore from '@/hooks/use-cart-store'
   import useCartSidebar from '@/hooks/use-cart-sidebar'

   export default function CartButton() {
     const isMounted = useIsMounted()
     const {
       cart: { items },
     } = useCartStore()
     const isCartSidebarOpen = useCartSidebar()
     const cartItemsCount = items.reduce((a, c) => a + c.quantity, 0)
     return (
       <Link href='/cart' className='px-1 header-button'>
         <div className='flex items-end text-xs relative'>
           <ShoppingCartIcon className='h-8 w-8' />

           {isMounted && (
             <span
               className={cn(
                 `bg-black  px-1 rounded-full text-primary text-base font-bold absolute right-[30px] top-[-4px] z-10`,
                 cartItemsCount >= 10 && 'text-sm px-0 p-[1px]'
               )}
             >
               {cartItemsCount}
             </span>
           )}
           <span className='font-bold'>Cart</span>
           {isCartSidebarOpen && (
             <div
               className={`absolute top-[20px] 'right-[-16px] rotate-[-90deg] z-10 w-0 h-0 border-l-[7px] border-r-[7px] border-b-[8px] border-transparent border-b-background`}
             ></div>
           )}
         </div>
       </Link>
     )
   }
   ```

7. components/shared/client-providers.tsx

   ```tsx
   'use client'
   import React from 'react'
   import useCartSidebar from '@/hooks/use-cart-sidebar'
   import CartSidebar from './cart-sidebar'
   import { Toaster } from '../ui/toaster'

   export default function ClientProviders({
     children,
   }: {
     children: React.ReactNode
   }) {
     const isCartSidebarOpen = useCartSidebar()

     return (
       <>
         {isCartSidebarOpen ? (
           <div className='flex min-h-screen'>
             <div className='flex-1 overflow-hidden'>{children}</div>
             <CartSidebar />
           </div>
         ) : (
           <div>{children}</div>
         )}
         <Toaster />
       </>
     )
   }
   ```

8. app/layout.tsx

   ```tsx
    <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
   ```

9. commit changes and push to GitHub
10. go to https://nextjs-amazona.vercel.app
