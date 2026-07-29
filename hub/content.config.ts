import { defineCollection, z } from '@nuxt/content'

const createEnum = (options: [string, ...string[]]) => z.enum(options)

const createLinkSchema = () => z.object({
  label: z.string().nonempty(),
  to: z.string().nonempty(),
  icon: z.string().optional().editor({ input: 'icon' }),
  trailingIcon: z.string().optional().editor({ input: 'icon' }),
  size: createEnum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
  trailing: z.boolean().optional(),
  target: createEnum(['_blank', '_self']).optional(),
  color: createEnum(['primary', 'secondary', 'neutral', 'error', 'warning', 'success', 'info']).optional(),
  variant: createEnum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link']).optional()
})

export const collections = {
  content: defineCollection({
    source: '**/index.yml',
    type: 'page',
    schema: z.object({
      locale: z.string().optional(),
      seo: z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty()
      }),
      hero: z.object({
        badge: z.string().nonempty(),
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        links: z.array(createLinkSchema())
      }),
      portalSection: z.object({
        title: z.string().nonempty(),
        subtitle: z.string().nonempty()
      }),
      loginCards: z.array(z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        badge: z.string().optional(),
        badgeLabel: z.string().optional(),
        icon: z.string().nonempty().editor({ input: 'icon' }),
        primaryButton: z.object({
          label: z.string().nonempty(),
          idpHint: z.string().optional()
        }).optional(),
        secondaryButton: z.object({
          label: z.string().nonempty(),
          variant: createEnum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link']).optional(),
          idpHint: z.string().optional()
        }).optional(),
        extraButton: z.object({
          label: z.string().nonempty(),
          idpHint: z.string().optional()
        }).optional()
      })),
      helpSection: z.object({
        title: z.string().nonempty(),
        items: z.array(z.object({
          title: z.string().nonempty(),
          description: z.string().nonempty(),
          icon: z.string().nonempty().editor({ input: 'icon' }),
          to: z.string().nonempty()
        }))
      }),
      chatWidget: z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        buttonLabel: z.string().nonempty()
      })
    })
  })
}
