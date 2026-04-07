import { FunctionComponent } from "react";
import { Card, CardContent } from "@/shared/ui/card";
interface HomePageProps {

}

const HomePage: FunctionComponent<HomePageProps> = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <h1 className="text-2xl font-bold text-red-500">BIENVENIDO</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            En este sitio podrá consultar el estado de sus clientes, para ello dirijase a la seccion de validar clientes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;