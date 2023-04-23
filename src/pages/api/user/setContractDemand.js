import {prisma} from "../../../../db";
import {contractSchema} from "../../../const";

export default async function handler(req, res){

    if(req.method !== 'POST'){
        return res.status(405).json({message: 'Méthode non autorisée.'});
    }

    try {
        await contractSchema.validate(req.body);
    }catch (error){
        return res.status(400).json({error, message: 'Erreur dans le formulaire'})
    }

    console.log(req.body)

    const {userId, contractType, startDate, endDate, company, comission, license, vehicule} = req.body;

    try {
        if(contractType === "Seller"){
            console.log(contractType)
            const contract = await prisma.contrat.create({
                data: {
                    dateDebut: startDate,
                    dateFin: endDate,
                    idUtilisateur: userId,
                    etat: 0,
                    ContratVendeur: {
                        create: {
                            comission: comission
                        }
                    }
                }
            })
            const vendeur = await prisma.vendeur.create({
                data: {
                    idUtilisateur: userId,
                    Entreprise: {
                        upsert:{
                            where:{
                                nom: company
                            },
                            update:{
                                nom: company
                            },
                            create: {
                                nom: company
                            }
                        }
                    }
                }
            })
            console.log(contract)
            console.log(vendeur)

            return res.status(200).json({})
        }
        else if(contractType === "Deliverer"){
            const contract = prisma.contrat.create({
                include:{
                    ContratVendeur: true
                },
                data: {
                    dateDebut: startDate,
                    dateFin: endDate,
                    idUtilisateur: userId,
                    etat: 0,
                    ContratVendeur: {
                        create: {
                            entrepriseAffiliee: company
                        }
                    }

                }
            })

            const vendeur = await prisma.livreur.create({
                data: {
                    idUtilisateur: userId,
                    permis: license,
                    vehicule: vehicule
                }
            })

            return res.status(200).json({})
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Une erreur est survenue"})
    }
}