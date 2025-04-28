import { Request, Response } from 'express';

import { ResourceRepository } from '../../repositories//admin/admin.resourceRepository';

export class ResourceController {

    static async create(req: Request, res: Response) {
    try {
        const { explainResource, audioUrl, imageUrl } = req.body;

        console.log("resourceData: ", req.body);
        // Validate required fields
        
        let createdResource = null;



        // Create new resource
  
        if (explainResource || audioUrl || imageUrl) {
            createdResource = await ResourceRepository.createResource(
            explainResource || null,
            audioUrl || null,
            imageUrl || null
        );
        }      

        res.status(201).json({
            success: true,
            data: createdResource,
            message: 'Resource created successfully'
        });
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating resource'
        });
    }

        
    }
}