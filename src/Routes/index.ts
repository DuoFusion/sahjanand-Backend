"use strict"
import { cmsRoutes } from './cms'
import express from 'express'
import { roleRoutes } from './role'
import { userRoutes } from './user'
import { aboutUsRoutes } from './about-us'
import { privacyPolicyRoutes } from './privacy-policy'
import { termsConditionRoutes } from './terms-condition'
import { returnPolicyRoutes } from './return-policy'
import { uploadRoutes } from './upload'
import { collectionRoutes } from './collection'
import blogRoutes from './blog'
import { categoryRoutes } from './category'
import { productRoutes } from './product'

const router = express.Router()

router.use('/user', userRoutes)
router.use('/role', roleRoutes)
router.use('/category', categoryRoutes)
router.use('/product', productRoutes)
router.use('/cms', cmsRoutes)
router.use('/about-us', aboutUsRoutes)
router.use('/privacy-policy', privacyPolicyRoutes)
router.use('/terms-condition', termsConditionRoutes)
router.use('/return-policy', returnPolicyRoutes)
router.use('/upload', uploadRoutes)
router.use('/collection', collectionRoutes)
router.use('/blog', blogRoutes)

export { router }