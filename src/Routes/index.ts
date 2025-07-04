"use strict"
import express from 'express'
import { adminJWT } from '../helper'
import { authRoutes } from './auth'
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
import { bannerRoutes } from './banner'
import { faqRoutes } from './faq'
import { productReviewRoutes } from './product_review'
import { testimonialRoutes } from './testimonial'
import { enquiryRoutes } from './enquiry'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/product', productRoutes)
router.use('/about-us', aboutUsRoutes)
router.use('/privacy-policy', privacyPolicyRoutes)
router.use('/terms-condition', termsConditionRoutes)
router.use('/return-policy', returnPolicyRoutes)
router.use('/enquiry', enquiryRoutes)
router.use('/testimonial', testimonialRoutes)
router.use('/banner', bannerRoutes)

router.use(adminJWT)
router.use('/role', roleRoutes)
router.use('/category', categoryRoutes)
router.use('/upload', uploadRoutes)
router.use('/collection', collectionRoutes)
router.use('/blog', blogRoutes)
router.use('/faq', faqRoutes)
router.use('/product-review', productReviewRoutes)

export { router }