"use strict"
import { cmsRoutes } from './cms'
import express from 'express'
import { roleRoutes } from './role'
import { userRoutes } from './user'
import { aboutUsRoutes } from './about-us'
import { privacyPolicyRoutes } from './privacy-policy'
import { termsConditionRoutes } from './terms-condition'
import { returnPolicyRoutes } from './return-policy'

const router = express.Router()

router.use('/user', userRoutes)
router.use('/role', roleRoutes)
router.use('/cms', cmsRoutes)
router.use('/about-us', aboutUsRoutes)
router.use('/privacy-policy', privacyPolicyRoutes)
router.use('/terms-condition', termsConditionRoutes)
router.use('/return-policy', returnPolicyRoutes)

export { router }