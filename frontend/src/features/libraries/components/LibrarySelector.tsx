import { useNavigate } from "react-router-dom";
import { Select } from "../../../components/ui/select";
import { BookmarkIcon } from "@radix-ui/react-icons";
import Styles from "../pages/LibrariesPage.module.scss";

interface LibrarySelectorProps {
    libraries: any[];
    selectedLibraryId: string;
    onSelectionChange: (libraryId: string) => void;
    basePath: string;
}

export function LibrarySelector({ libraries, selectedLibraryId, onSelectionChange, basePath }: LibrarySelectorProps) {
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const libId = e.target.value;
        onSelectionChange(libId);
        if (libId !== "all") {
            navigate(`${basePath}/${libId}`);
        }
    };

    return (
        <div className={Styles.librarySelector}>
            <Select
                value={selectedLibraryId}
                onChange={handleChange}
                options={[
                    { value: "all", label: "Toutes les bibliothèques" },
                    ...libraries.map((lib: any) => ({
                        value: lib.id_library,
                        label: lib.lib_name || lib.name
                    }))
                ]}
                icon={<BookmarkIcon />}
                aria-label="Sélectionner une bibliothèque"
            />
        </div>
    );
}
