from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api.deps import get_db
from app.models.subject import Department, Semester
from app.data.mu_subjects import ALL_DEPARTMENT_SUBJECTS, ELECTIVE_SUBJECTS, STANDARD_COMPONENTS

router = APIRouter()

@router.get("/catalog", response_model=List[schemas.SubjectCatalog])
def get_subject_catalog(
    department: Department = Query(..., description="Department filter"),
    semester: Semester = Query(None, description="Semester filter (optional)"),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get subject catalog filtered by department and optionally by semester.
    """
    if semester:
        subjects = crud.subject_catalog.get_by_dept_and_sem(
            db=db, department=department, semester=semester
        )
    else:
        subjects = crud.subject_catalog.get_by_department(
            db=db, department=department
        )
    return subjects

@router.get("/catalog/populate")
def populate_subject_catalog(
    db: Session = Depends(get_db),
) -> Any:
    """
    Populate the subject catalog with subjects for all engineering departments.
    This is typically run once during system setup.
    """
    try:
        # Clear existing catalog for all departments
        db.query(crud.subject_catalog.model).delete()
        
        # Add subjects for all departments
        for department, department_subjects in ALL_DEPARTMENT_SUBJECTS.items():
            for semester, subjects in department_subjects.items():
                for subject_data in subjects:
                    catalog_entry = crud.subject_catalog.model(
                        department=department,
                        semester=semester,
                        **subject_data
                    )
                    db.add(catalog_entry)
        
        # Add elective subjects (typically for Sem VII & VIII)
        for subject_data in ELECTIVE_SUBJECTS:
            # Add to both Sem VII and VIII as electives
            for sem in [Semester.VII, Semester.VIII]:
                catalog_entry = crud.subject_catalog.model(
                    department=Department.COMPUTER_ENGINEERING,
                    semester=sem,
                    **subject_data
                )
                db.add(catalog_entry)
        
        db.commit()
        return {"message": "Subject catalog populated successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error populating catalog: {str(e)}")

@router.post("/", response_model=schemas.Subject)
def create_subject(
    *,
    db: Session = Depends(get_db),
    subject_in: schemas.SubjectCreate,
) -> Any:
    """
    Create new subject with components.
    """
    # Check if subject with same code already exists for the year
    existing = crud.subject.get_by_code_and_year(
        db=db, subject_code=subject_in.subject_code, year=subject_in.year
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Subject with code {subject_in.subject_code} already exists for year {subject_in.year}"
        )
    
    subject = crud.subject.create_with_components(db=db, obj_in=subject_in)
    return subject

@router.get("/", response_model=List[schemas.Subject])
def read_subjects(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    year: str = Query(None, description="Filter by academic year"),
    department: Department = Query(None, description="Filter by department"),
    semester: Semester = Query(None, description="Filter by semester"),
) -> Any:
    """
    Retrieve subjects with optional filters.
    """
    if year and department and semester:
        subjects = crud.subject.get_by_year_dept_sem(
            db=db, year=year, department=department, semester=semester
        )
    else:
        subjects = crud.subject.get_multi(db, skip=skip, limit=limit)
    return subjects

@router.get("/{subject_id}", response_model=schemas.Subject)
def read_subject(
    *,
    db: Session = Depends(get_db),
    subject_id: int,
) -> Any:
    """
    Get subject by ID.
    """
    subject = crud.subject.get(db=db, id=subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

@router.put("/{subject_id}", response_model=schemas.Subject)
def update_subject(
    *,
    db: Session = Depends(get_db),
    subject_id: int,
    subject_in: schemas.SubjectUpdate,
) -> Any:
    """
    Update a subject.
    """
    subject = crud.subject.get(db=db, id=subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    subject = crud.subject.update(db=db, db_obj=subject, obj_in=subject_in)
    return subject

@router.delete("/{subject_id}")
def delete_subject(
    *,
    db: Session = Depends(get_db),
    subject_id: int,
) -> Any:
    """
    Delete a subject.
    """
    subject = crud.subject.get(db=db, id=subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    subject = crud.subject.remove(db=db, id=subject_id)
    return {"message": "Subject deleted successfully"}

@router.get("/templates/components")
def get_component_templates() -> Any:
    """
    Get standard component templates for different subject types.
    """
    return STANDARD_COMPONENTS

@router.post("/{subject_id}/components", response_model=schemas.SubjectComponent)
def add_subject_component(
    *,
    db: Session = Depends(get_db),
    subject_id: int,
    component_in: schemas.SubjectComponentCreate,
) -> Any:
    """
    Add a component to an existing subject.
    """
    subject = crud.subject.get(db=db, id=subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    component_data = component_in.dict()
    component_data["subject_id"] = subject_id
    component = crud.subject_component.create(db=db, obj_in=component_data)
    return component

@router.put("/components/{component_id}", response_model=schemas.SubjectComponent)
def update_subject_component(
    *,
    db: Session = Depends(get_db),
    component_id: int,
    component_in: schemas.SubjectComponentUpdate,
) -> Any:
    """
    Update a subject component.
    """
    component = crud.subject_component.get(db=db, id=component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    component = crud.subject_component.update(db=db, db_obj=component, obj_in=component_in)
    return component

@router.delete("/components/{component_id}")
def delete_subject_component(
    *,
    db: Session = Depends(get_db),
    component_id: int,
) -> Any:
    """
    Delete a subject component.
    """
    component = crud.subject_component.get(db=db, id=component_id)
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    crud.subject_component.remove(db=db, id=component_id)
    return {"message": "Component deleted successfully"}
