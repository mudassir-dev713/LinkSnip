import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {deskTool} from 'sanity/desk'

export default defineConfig({
  name: 'default',
  title: 'UrlSnip Blog',

  projectId: 'de5yc6xu',
  dataset: 'production',

  plugins: [deskTool(), visionTool(), structureTool()],

  schema: {
    types: schemaTypes,
  },
})
