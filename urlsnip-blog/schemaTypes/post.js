export default {
  name: 'post',
  title: 'Blog Posts',
  type: 'document',

  fields: [
    // Title
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(5).max(120),
    },

    // Slug (auto from title)
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 120},
      validation: (Rule) => Rule.required(),
    },

    // Main image
    {
      name: 'mainImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    },

    {
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
    },
    // Rich Text Content
    {
      name: 'content',
      title: 'Article Content',
      type: 'array',
      of: [{type: 'block'}, {type: 'image'}],
      validation: (Rule) => Rule.required(),
    },

    // SEO fields
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {name: 'title', type: 'string', title: 'SEO Title'},
        {name: 'description', type: 'text', title: 'SEO Description'},
        {name: 'keywords', type: 'string', title: 'SEO Keywords'},
      ],
    },

    // Publish date (optional)
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    },
  ],

  // Default ordering
  orderings: [
    {
      title: 'Publish Date',
      name: 'publishDateDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
}
