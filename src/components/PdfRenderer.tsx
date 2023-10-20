'use client'

import React from "react";
import {Document,Page} from "react-pdf";

import {Loader2} from 'lucide-react'
import { useToast } from './ui/use-toast'

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PdfRendererProps {
	url: string
  }


function PdfRenderer({ url }: PdfRendererProps) {
	const { toast } = useToast()
	return <div ref={ref}>
            <Document
              loading={
                <div className='flex justify-center'>
                  <Loader2 className='my-24 h-6 w-6 animate-spin' />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: 'Error loading PDF',
                  description: 'Please try again later',
                  variant: 'destructive',
                })
              }}
              file={url}
              className='max-h-full'>

				<Page
                  width={width ? width : 1}
                  pageNumber={1}
                />
            </Document>
			</div>;
}

export default PdfRenderer;
