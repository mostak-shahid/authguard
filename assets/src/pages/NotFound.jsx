import React from 'react'
import { NotFound as NotFoundComponent } from '../components'
import { FullWidthLayout } from '../layouts'
export default function NotFound() {
    return (
        <FullWidthLayout className="flex justify-center items-center ">
            <NotFoundComponent />
        </FullWidthLayout>
    )
}
